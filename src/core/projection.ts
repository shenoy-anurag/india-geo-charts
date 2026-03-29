import { geoCentroid, geoConicEqualArea, geoMercator, geoPath, type GeoProjection, type GeoPath } from 'd3-geo';
import type { Bounds, FeatureCollection, GeoFeature, GeoGeometry } from '../types.js';

const ISLAND_TRANSLATION_OFFSETS: Record<string, [number, number]> = {
  'Andaman and Nicobar': [-8, 3],
  'Lakshadweep': [-2, 2.1]
};

function getIslandTranslation(feature: GeoFeature): [number, number] | null {
  const name = String(feature.properties?.NAME_1 || feature.properties?.name || feature.id || '').trim();
  return ISLAND_TRANSLATION_OFFSETS[name] ?? null;
}

function translateCoordinates(coordinates: any, offset: [number, number]): any {
  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    return [coordinates[0] + offset[0], coordinates[1] + offset[1]];
  }
  return coordinates.map((coord: any) => translateCoordinates(coord, offset));
}

function translateGeometry(geometry: GeoGeometry, offset: [number, number]): GeoGeometry {
  return {
    ...geometry,
    coordinates: translateCoordinates(geometry.coordinates, offset) as any
  };
}

function translateFeature(feature: GeoFeature, offset: [number, number]): GeoFeature {
  return {
    ...feature,
    geometry: translateGeometry(feature.geometry, offset)
  };
}

function scaleCoordinates(coordinates: any, center: [number, number], factor: number): any {
  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    return [
      center[0] + (coordinates[0] - center[0]) * factor,
      center[1] + (coordinates[1] - center[1]) * factor
    ];
  }
  return coordinates.map((coord: any) => scaleCoordinates(coord, center, factor));
}

function scaleGeometry(geometry: GeoGeometry, center: [number, number], factor: number): GeoGeometry {
  return {
    ...geometry,
    coordinates: scaleCoordinates(geometry.coordinates, center, factor) as any
  };
}

function scaleFeature(feature: GeoFeature, factor: number): GeoFeature {
  const center = geoCentroid(feature) as [number, number];
  return {
    ...feature,
    geometry: scaleGeometry(feature.geometry, center, factor)
  };
}

function getIslandScaleFactor(feature: GeoFeature): number | null {
  const name = String(feature.properties?.NAME_1 || feature.properties?.name || feature.id || '').trim();
  if (name === 'Lakshadweep') return 2;
  return null;
}

export function repositionIndianIslands(input: GeoFeature | GeoGeometry | FeatureCollection): GeoFeature | GeoGeometry | FeatureCollection {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return input;
  }

  if ('type' in input && input.type === 'FeatureCollection') {
    return {
      ...input,
      features: input.features.map((feature) => {
        const scaleFactor = getIslandScaleFactor(feature);
        const translation = getIslandTranslation(feature);
        let updatedFeature = scaleFactor ? scaleFeature(feature, scaleFactor) : feature;
        return translation ? translateFeature(updatedFeature, translation) : updatedFeature;
      })
    };
  }

  if ('type' in input && (input as GeoFeature).geometry) {
    const feature = input as GeoFeature;
    const scaleFactor = getIslandScaleFactor(feature);
    const translation = getIslandTranslation(feature);
    const updatedFeature = scaleFactor ? scaleFeature(feature, scaleFactor) : feature;
    return translation ? translateFeature(updatedFeature, translation) : updatedFeature;
  }

  return input;
}

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
  config?: { padding?: number; center?: [number, number]; parallels?: [number, number]; rotate?: [number, number, number] }
): ProjectionContext {
  const padding = config?.padding ?? 10;

  let projection: GeoProjection;
  if (type === 'mercator') {
    projection = geoMercator();
  } else {
    // Albers-style conic projection calibrated specifically for India
    // D3's geoAlbers() is hardcoded for the USA with special insets.
    projection = geoConicEqualArea()
      .rotate(config?.rotate || [-78.9629, 0])      // Central Meridian for India
      .center(config?.center || [0, 22.5937])       // Center Latitude
      .parallels(config?.parallels || [12.44, 35.17]); // Standard India Albers parallels
  }

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
