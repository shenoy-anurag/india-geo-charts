import type { GeoFeature, Point, GeoGeometry } from '../types';

function moveTo(x: number, y: number): string {
  return `M${x.toFixed(2)},${y.toFixed(2)}`;
}

function lineTo(x: number, y: number): string {
  return `L${x.toFixed(2)},${y.toFixed(2)}`;
}

function closePath(): string {
  return 'Z';
}

export function projectRing(
  ring: number[][],
  project: (lng: number, lat: number) => Point
): string {
  if (ring.length === 0) return '';
  
  const points = ring.map(coord => project(coord[0] ?? 0, coord[1] ?? 0));
  
  let path = moveTo(points[0]?.x ?? 0, points[0]?.y ?? 0);
  
  for (let i = 1; i < points.length; i++) {
    path += lineTo(points[i]?.x ?? 0, points[i]?.y ?? 0);
  }
  
  path += closePath();
  
  return path;
}

export function projectPolygon(
  coords: number[][][],
  project: (lng: number, lat: number) => Point
): string {
  return coords.map(ring => projectRing(ring, project)).join(' ');
}

export function projectMultiPolygon(
  coords: number[][][][],
  project: (lng: number, lat: number) => Point
): string {
  return coords.map(polygon => projectPolygon(polygon, project)).join(' ');
}

export function projectGeometry(
  geometry: GeoGeometry,
  project: (lng: number, lat: number) => Point
): string {
  switch (geometry.type) {
    case 'Polygon':
      return projectPolygon(geometry.coordinates, project);
    case 'MultiPolygon':
      return projectMultiPolygon(geometry.coordinates, project);
    case 'MultiLineString':
      return geometry.coordinates.map(line => 
        line.map((coord, i) => 
          i === 0 
            ? moveTo(coord[0] ?? 0, coord[1] ?? 0)
            : lineTo(coord[0] ?? 0, coord[1] ?? 0)
        ).join('') + closePath()
      ).join(' ');
    case 'LineString':
      return geometry.coordinates.map((coord, i) => 
        i === 0 
          ? moveTo(coord[0] ?? 0, coord[1] ?? 0)
          : lineTo(coord[0] ?? 0, coord[1] ?? 0)
      ).join('') + closePath();
    case 'Point': {
      const p = project((geometry.coordinates[0] ?? 0), (geometry.coordinates[1] ?? 0));
      return moveTo(p.x, p.y);
    }
    default:
      return '';
  }
}

export function projectFeature(
  feature: GeoFeature,
  project: (lng: number, lat: number) => Point
): string {
  if (!feature.geometry) return '';
  return projectGeometry(feature.geometry, project);
}

export function calculateFeatureCentroid(
  feature: GeoFeature,
  project: (lng: number, lat: number) => Point
): Point {
  if (!feature.geometry) return { x: 0, y: 0 };
  
  let totalX = 0, totalY = 0;
  let count = 0;
  
  function extractCoords(g: GeoGeometry) {
    if (g.type === 'Point') {
      totalX += g.coordinates[0] ?? 0;
      totalY += g.coordinates[1] ?? 0;
      count++;
    } else if (g.type === 'LineString') {
      for (const coord of g.coordinates) {
        totalX += coord[0] ?? 0;
        totalY += coord[1] ?? 0;
        count++;
      }
    } else if (g.type === 'Polygon') {
      for (const ring of g.coordinates) {
        for (const coord of ring) {
          totalX += coord[0] ?? 0;
          totalY += coord[1] ?? 0;
          count++;
        }
      }
    } else if (g.type === 'MultiPoint') {
      for (const coord of g.coordinates) {
        totalX += coord[0] ?? 0;
        totalY += coord[1] ?? 0;
        count++;
      }
    } else if (g.type === 'MultiLineString') {
      for (const line of g.coordinates) {
        for (const coord of line) {
          totalX += coord[0] ?? 0;
          totalY += coord[1] ?? 0;
          count++;
        }
      }
    } else if (g.type === 'MultiPolygon') {
      for (const polygon of g.coordinates) {
        for (const ring of polygon) {
          for (const coord of ring) {
            totalX += coord[0] ?? 0;
            totalY += coord[1] ?? 0;
            count++;
          }
        }
      }
    }
  }
  
  extractCoords(feature.geometry);
  
  if (count === 0) return { x: 0, y: 0 };
  
  const avgLng = totalX / count;
  const avgLat = totalY / count;
  
  return project(avgLng, avgLat);
}

export function extractBoundsFromGeoJson(
  features: GeoFeature[]
): Bounds {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  function updateBounds(coords: number[][]) {
    for (const coord of coords) {
      const lng = coord[0] ?? 0;
      const lat = coord[1] ?? 0;
      if (lng < minX) minX = lng;
      if (lng > maxX) maxX = lng;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
    }
  }
  
  for (const feature of features) {
    if (!feature.geometry) continue;
    
    const g = feature.geometry;
    
    if (g.type === 'Point') {
      updateBounds([g.coordinates]);
    } else if (g.type === 'LineString') {
      updateBounds(g.coordinates);
    } else if (g.type === 'Polygon') {
      for (const ring of g.coordinates) updateBounds(ring);
    } else if (g.type === 'MultiPoint') {
      updateBounds(g.coordinates);
    } else if (g.type === 'MultiLineString') {
      for (const line of g.coordinates) updateBounds(line);
    } else if (g.type === 'MultiPolygon') {
      for (const polygon of g.coordinates) {
        for (const ring of polygon) updateBounds(ring);
      }
    }
  }
  
  if (!isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  }
  
  return { 
    minX, 
    minY, 
    maxX, 
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}
