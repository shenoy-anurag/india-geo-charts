import * as topojson from 'topojson-client';
import type { TopoTopology, GeoFeature, GeoGeometry, MultiLineStringGeometry } from '../types.js';

export function getTopoFeature(topology: TopoTopology, objectKey: string): GeoFeature | GeoGeometry {
  const obj = topology.objects[objectKey];
  if (!obj) {
    throw new Error(`Object with key '${objectKey}' not found in topology.`);
  }
  // topojson.feature returns a Feature or FeatureCollection.
  // We type cast it to GeoFeature loosely or return as geometry.
  return topojson.feature(topology as any, obj) as unknown as GeoFeature | GeoGeometry;
}

export function getTopoMesh(topology: TopoTopology, objectKey: string): MultiLineStringGeometry {
  const obj = topology.objects[objectKey];
  if (!obj) {
    throw new Error(`Object with key '${objectKey}' not found in topology.`);
  }
  return topojson.mesh(topology as any, obj) as unknown as MultiLineStringGeometry;
}

export function getAllFeatures(topology: TopoTopology): GeoFeature[] {
  const features: GeoFeature[] = [];
  for (const key of Object.keys(topology.objects)) {
    const obj = topology.objects[key];
    if (obj.type === 'GeometryCollection') {
      const featureCollection = topojson.feature(topology as any, obj) as any;
      if (featureCollection && featureCollection.type === 'FeatureCollection') {
        features.push(...(featureCollection.features as GeoFeature[]));
      }
    } else {
      features.push(topojson.feature(topology as any, obj) as unknown as GeoFeature);
    }
  }
  return features;
}

export function getStates(topology: TopoTopology): GeoFeature[] {
  const features: GeoFeature[] = [];
  for (const key of Object.keys(topology.objects)) {
    if (key === 'states') {
      const obj = topology.objects[key];
      if (obj.type === 'GeometryCollection') {
        const featureCollection = topojson.feature(topology as any, obj) as any;
        if (featureCollection && featureCollection.type === 'FeatureCollection') {
          features.push(...(featureCollection.features as GeoFeature[]));
        }
      } else {
        features.push(topojson.feature(topology as any, obj) as unknown as GeoFeature);
      }
    }
  }
  return features;
}

export function getDistricts(topology: TopoTopology): GeoFeature[] {
  const features: GeoFeature[] = [];
  for (const key of Object.keys(topology.objects)) {
    if (key === 'districts') {
      const obj = topology.objects[key];
      if (obj.type === 'GeometryCollection') {
        const featureCollection = topojson.feature(topology as any, obj) as any;
        if (featureCollection && featureCollection.type === 'FeatureCollection') {
          features.push(...(featureCollection.features as GeoFeature[]));
        }
      } else {
        features.push(topojson.feature(topology as any, obj) as unknown as GeoFeature);
      }
    }
  }
  return features;
}

export function getFeatureId(feature: GeoFeature): string {
  if (feature.id !== undefined) {
    return String(feature.id);
  }
  const name = feature.properties?.name;
  return (typeof name === 'string' ? name : '') || 'unknown';
}
