import { geoAlbers, geoMercator, geoPath, type GeoProjection, type GeoPath } from 'd3-geo';
import type { Bounds, GeoFeature, GeoGeometry } from '../types.js';

export interface ProjectionContext {
  projection: GeoProjection;
  pathGenerator: GeoPath;
  bounds: Bounds;
  project: (lng: number, lat: number) => { x: number; y: number } | null;
}

/**
 * Unified factory for creating fit-to-bounds projections using d3-geo.
 */
export function createProjection(
  type: 'mercator' | 'albers',
  outlineFeature: GeoFeature | GeoGeometry,
  width: number,
  height: number,
  config?: { padding?: number }
): ProjectionContext {
  const padding = config?.padding ?? 10;
  
  const projection = type === 'mercator' ? geoMercator() : geoAlbers();
  
  // Fit projection to the bounds of the provided outline feature
  projection.fitExtent(
    [
      [padding, padding],
      [width - padding, height - padding]
    ],
    outlineFeature as any
  );
  
  const pathGenerator = geoPath(projection);
  
  // Extract computed pixel bounds for the generated SVG projection
  const [[minX, minY], [maxX, maxY]] = pathGenerator.bounds(outlineFeature as any);
  
  return {
    projection,
    pathGenerator,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    },
    project: (lng: number, lat: number) => {
      const p = projection([lng, lat]);
      return p ? { x: p[0], y: p[1] } : null;
    }
  };
}
