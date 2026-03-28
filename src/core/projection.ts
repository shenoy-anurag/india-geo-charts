import type { Point, Bounds, GeoFeature, GeoGeometry, GeoJSON } from '../types';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function clip(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n;
}

export function mercatorProject(
  lng: number,
  lat: number,
  _bounds: Bounds
): Point {
  const x = lng;
  const y = Math.log(Math.tan(Math.PI / 4 + clip(lat, -89.9, 89.9) * DEG_TO_RAD / 2));
  return { x, y };
}

export function createMercatorProjection(
  bounds: Bounds,
  targetWidth: number,
  targetHeight: number,
  padding = 10
): { project: (lng: number, lat: number) => Point; bounds: Bounds } {
  const projectedBounds = {
    minX: mercatorProject(bounds.minX, 0, bounds).x,
    maxX: mercatorProject(bounds.maxX, 0, bounds).x,
    minY: mercatorProject(0, bounds.minY, bounds).y,
    maxY: mercatorProject(0, bounds.maxY, bounds).y
  };
  
  const projWidth = projectedBounds.maxX - projectedBounds.minX;
  const projHeight = projectedBounds.maxY - projectedBounds.minY;
  
  const scaleX = (targetWidth - padding * 2) / projWidth;
  const scaleY = (targetHeight - padding * 2) / projHeight;
  const scale = Math.min(scaleX, scaleY);
  
  const offsetX = (targetWidth - projWidth * scale) / 2 - projectedBounds.minX * scale;
  const offsetY = (targetHeight - projHeight * scale) / 2 - projectedBounds.minY * scale;
  
  return {
    project(lng: number, lat: number): Point {
      const p = mercatorProject(lng, lat, bounds);
      return {
        x: p.x * scale + offsetX,
        y: p.y * scale + offsetY
      };
    },
    bounds: {
      minX: projectedBounds.minX * scale + offsetX,
      maxX: projectedBounds.maxX * scale + offsetX,
      minY: projectedBounds.minY * scale + offsetY,
      maxY: projectedBounds.maxY * scale + offsetY,
      width: projWidth * scale,
      height: projHeight * scale
    }
  };
}

function albersRaw(
  lng: number,
  lat: number,
  φ0: number,
  φ1: number,
  φ2: number,
  n: number,
  C: number,
  ρ0: number,
  scale: number
): { x: number; y: number } {
  const θ = n * (lng - lng0) * DEG_TO_RAD;
  const φ = lat * DEG_TO_RAD;
  const ρ = scale * Math.sqrt(C - 2 * n * Math.sin(φ) + (n === 0 ? 0 : Math.pow(n, 2)));
  const x = ρ * Math.sin(θ);
  const y = ρ0 - ρ * Math.cos(θ);
  return { x, y };
}

let lng0 = 0;

export function createAlbersProjection(
  bounds: Bounds,
  targetWidth: number,
  targetHeight: number,
  center: [number, number] = [78, 20],
  parallels: [number, number] = [15, 35],
  padding = 10
): { project: (lng: number, lat: number) => Point; bounds: Bounds } {
  lng0 = center[0];
  const φ0 = center[1];
  const φ1 = parallels[0];
  const φ2 = parallels[1];
  
  const n = (φ1 + φ2) / 2;
  const C = Math.pow(Math.cos(φ1 * DEG_TO_RAD), 2) 
           + 2 * n * Math.sin(φ1 * DEG_TO_RAD);
  
  const midLat = (bounds.minY + bounds.maxY) / 2;
  const midLng = (bounds.minX + bounds.maxX) / 2;
  
  const testProj = (lng: number, lat: number) => {
    return albersRaw(lng, lat, φ0, φ1, φ2, n, C, 0, 1);
  };
  
  const corners = [
    testProj(bounds.minX, bounds.minY),
    testProj(bounds.maxX, bounds.minY),
    testProj(bounds.minX, bounds.maxY),
    testProj(bounds.maxX, bounds.maxY),
    testProj(midLng, bounds.minY),
    testProj(midLng, bounds.maxY),
    testProj(bounds.minX, midLat),
    testProj(bounds.maxX, midLat)
  ];
  
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  for (const p of corners) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  
  const projWidth = maxX - minX;
  const projHeight = maxY - minY;
  
  const scaleX = (targetWidth - padding * 2) / projWidth;
  const scaleY = (targetHeight - padding * 2) / projHeight;
  const scale = Math.min(scaleX, scaleY);
  
  const ρ0 = (targetHeight / 2) / scale;
  
  const offsetX = (targetWidth - projWidth * scale) / 2 - minX * scale;
  const offsetY = (targetHeight - projHeight * scale) / 2 - minY * scale;
  
  return {
    project(lng: number, lat: number): Point {
      const p = albersRaw(lng, lat, φ0, φ1, φ2, n, C, ρ0, scale);
      return {
        x: p.x + offsetX,
        y: p.y + offsetY
      };
    },
    bounds: {
      minX: minX * scale + offsetX,
      maxX: maxX * scale + offsetX,
      minY: minY * scale + offsetY,
      maxY: maxY * scale + offsetY,
      width: projWidth * scale,
      height: projHeight * scale
    }
  };
}

export function createProjection(
  type: 'mercator' | 'albers',
  bounds: Bounds,
  width: number,
  height: number,
  config?: {
    center?: [number, number];
    parallels?: [number, number];
    padding?: number;
  }
): { project: (lng: number, lat: number) => Point; bounds: Bounds } {
  const padding = config?.padding ?? 10;
  
  if (type === 'mercator') {
    return createMercatorProjection(bounds, width, height, padding);
  }
  
  return createAlbersProjection(
    bounds,
    width,
    height,
    config?.center,
    config?.parallels,
    padding
  );
}
