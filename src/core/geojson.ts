import type { GeoFeature, GeoJSON, GeoGeometry, FeatureCollection, Point } from '../types.js';

export function parseGeoJson(input: GeoJSON): GeoFeature[] {
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return parseGeoJson(parsed as GeoJSON);
    } catch {
      throw new Error('Invalid GeoJSON string');
    }
  }

  if (input.type === 'FeatureCollection') {
    return (input as FeatureCollection).features;
  }

  if (input.type === 'Feature') {
    return [input as GeoFeature];
  }

  if ('coordinates' in input) {
    return [{
      type: 'Feature',
      geometry: input as GeoGeometry,
      properties: {}
    }];
  }

  throw new Error('Invalid GeoJSON: must be FeatureCollection, Feature, or Geometry');
}

export function validateGeoJson(input: GeoJSON): boolean {
  try {
    parseGeoJson(input);
    return true;
  } catch {
    return false;
  }
}

export function getFeatureId(feature: GeoFeature): string {
  if (feature.id !== undefined) {
    return String(feature.id);
  }
  return feature.properties?.name || 'unknown';
}

export function getFeatureName(feature: GeoFeature): string {
  return feature.properties?.name || getFeatureId(feature);
}

export function calculateBounds(points: Point[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
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

export function calculateCentroid(coords: number[][][]): Point {
  let totalX = 0;
  let totalY = 0;
  let count = 0;

  for (const ring of coords) {
    for (let i = 0; i < ring.length - 1; i++) {
      const lng = ring[i]?.[0] ?? 0;
      const lat = ring[i]?.[1] ?? 0;
      totalX += lng;
      totalY += lat;
      count++;
    }
  }

  return {
    x: totalX / count,
    y: totalY / count
  };
}

export function extractCoordinates(geometry: GeoGeometry): number[][][] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates;
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flat();
  }

  return [];
}
