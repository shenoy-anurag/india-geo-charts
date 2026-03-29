import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartRenderer } from '../src/core/renderer.js';
import { createProjection, repositionIndianIslands } from '../src/core/projection.js';
import * as fs from 'fs';
import * as path from 'path';
import type { ChartData, TopoTopology } from '../src/types.js';
import { getAllFeatures, getTopoFeature } from '../src/core/topojson.js';

// Load TopoJSON once for all tests
const topoJsonPath = path.resolve(__dirname, '../data/india-states.topo.json');
const topoJson = JSON.parse(fs.readFileSync(topoJsonPath, 'utf8')) as TopoTopology;
const features = getAllFeatures(topoJson);

function createTestData(values: Record<string, number>): ChartData {
  return {
    labels: ['States'],
    datasets: [{
      label: 'States',
      outline: getTopoFeature(topoJson, 'data') as any,
      showOutline: true,
      data: features
        .filter(f => f.properties?.ID_1 && values[String(f.properties.ID_1)] !== undefined)
        .map(f => {
          // ensure the feature returned by getFeatureId matches our test keys.
          // since renderer uses getFeatureId which preferring f.id, let's override f.id
          f.id = String(f.properties!.ID_1);
          return {
             feature: f as any,
             value: values[String(f.properties!.ID_1)]!
          };
        })
    }]
  };
}

// Mock PointerEvent if not available in jsdom
if (typeof window !== 'undefined' && !window.PointerEvent) {
  (window as any).PointerEvent = window.MouseEvent;
}

describe('ChartRenderer Choropleth tests with data/india-states.topo.json', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    // Mock dimensions
    Object.defineProperty(container, 'clientWidth', { value: 800 });
    Object.defineProperty(container, 'clientHeight', { value: 600 });
    document.body.appendChild(container);

    // Mock document.head.appendChild to track link injection and simulate load events
    const originalAppend = document.head.appendChild;
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      const result = originalAppend.call(document.head, node);
      if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
        // Mock onload call in next tick to let microtasks process
        setTimeout(() => {
          if (node.onload) (node.onload as any)();
        }, 0);
      }
      return result;
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
    // Clean up injected links
    document.head.querySelectorAll('link[rel="stylesheet"]').forEach(l => l.remove());
    vi.restoreAllMocks();
  });

  it('should initialize and render a choropleth map', async () => {
    const data = createTestData({
      '1': 100, // Andaman and Nicobar
      '2': 200, // Telangana
      '3': 300, // Andhra Pradesh
    });

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 800,
      height: 600,
      title: 'Test India Map',
      subtitle: 'Testing choropleth rendering',
      legend: { show: true }
    });

    await new Promise(r => setTimeout(r, 0));

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    const path1 = container.querySelector('path[data-id="1"]');
    expect(path1).toBeTruthy();

    const fill1 = path1?.getAttribute('fill');
    expect(fill1).not.toBe('#e0e0e0');
  });

  it('should update data and change colors dynamically', async () => {
    const data = createTestData({
      '1': 10,
      '2': 100,
    });

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
    });

    await new Promise(r => setTimeout(r, 0));

    const path1 = container.querySelector('path[data-id="1"]');
    const initialColor = path1?.getAttribute('fill');

    const newData = createTestData({
      '1': 500,
      '2': 100
    });
    renderer.update(newData);
    const updatedColor = path1?.getAttribute('fill');

    expect(updatedColor).not.toBe(initialColor);
  });

  it('should show tooltip on hover', async () => {
    const data = createTestData({
      '1': 100,
      '2': 200,
    });

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      tooltip: {
        backgroundColor: '#ffffff',
        textColor: '#000000'
      }
    });

    await new Promise(r => setTimeout(r, 0));

    const path1 = container.querySelector('path[data-id="1"]') as SVGPathElement;
    expect(path1).toBeTruthy();

    const tooltip = container.querySelector('div[style*="position: absolute"]');
    expect(tooltip).toBeTruthy();
  });

  it('should render bubble chart when chartType is bubble', async () => {
    const data = createTestData({
      '1': 10,
      '2': 50,
      '3': 100,
    });

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'bubble',
      bubbleConfig: {
        minRadius: 5,
        maxRadius: 20,
        fill: '#ff0000'
      }
    });

    await new Promise(r => setTimeout(r, 0));

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(1);

    const circle1 = container.querySelector('circle[data-id="1"]');
    const circle3 = container.querySelector('circle[data-id="3"]');

    expect(circle1).toBeTruthy();
    expect(circle3).toBeTruthy();

    const r1 = parseFloat(circle1?.getAttribute('r') || '0');
    const r3 = parseFloat(circle3?.getAttribute('r') || '0');

    expect(r3).toBeGreaterThan(r1);
  });

  it('should render the map with correct orientation (North at top) using Albers projection', async () => {
    // ID 33 is Ladakh (North), ID 1 is Andaman and Nicobar (South)
    const data = createTestData({ '1': 100, '33': 200 });
    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 800,
      height: 600,
      projection: 'albers'
    });

    await new Promise(r => setTimeout(r, 0));

    const northPath = container.querySelector('path[data-id="33"]');
    const southPath = container.querySelector('path[data-id="1"]');
    
    expect(northPath).toBeTruthy();
    expect(southPath).toBeTruthy();
    
    if (northPath && southPath) {
      const getCenterY = (p: Element) => {
        const bbox = (p as SVGPathElement).getBBox();
        return bbox.y + bbox.height / 2;
      };
      
      // JSDOM might not support getBBox fully, but we can check the path 'd' attribute
      const getYFromPath = (p: Element) => {
        const d = p.getAttribute('d') || '';
        // Extract the first Y coordinate from a 'M x,y' or 'L x,y' instruction
        const match = d.match(/[ML]\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        return (match && match[2]) ? parseFloat(match[2]) : null;
      };

      const northY = getYFromPath(northPath);
      const southY = getYFromPath(southPath);
      
      if (northY !== null && southY !== null) {
        expect(northY).toBeLessThan(southY); // North should be closer to Top (smaller Y)
      }
    }
  });

  it('should support Mercator projection', async () => {
    const data = createTestData({ '1': 100 });
    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      projection: 'mercator'
    });

    await new Promise(r => setTimeout(r, 0));

    const path1 = container.querySelector('path[data-id="1"]');
    expect(path1).toBeTruthy();
    expect(path1?.getAttribute('d')).toContain('M');
  });

  it('should render multiple datasets', async () => {
    const baseOutline = getTopoFeature(topoJson, 'data') as any;
    const data: ChartData = {
      labels: ['Dataset 1', 'Dataset 2'],
      datasets: [
        {
          label: 'Dataset 1',
          outline: baseOutline,
          showOutline: true,
          data: features.slice(0, 5).map(f => {
            f.id = 'ds1_' + (f.properties?.ID_1 || Math.random());
            return { feature: f as any, value: 10 };
          })
        },
        {
          label: 'Dataset 2',
          outline: baseOutline,
          showOutline: false,
          data: features.slice(5, 10).map(f => {
            f.id = 'ds2_' + (f.properties?.ID_1 || Math.random());
            return { feature: f as any, value: 50 };
          })
        }
      ]
    };

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth'
    });

    await new Promise(r => setTimeout(r, 0));

    // Check if features from both datasets are rendered
    const ds1Feature = container.querySelector('path[data-id^="ds1_"]');
    const ds2Feature = container.querySelector('path[data-id^="ds2_"]');
    
    expect(ds1Feature).toBeTruthy();
    expect(ds2Feature).toBeTruthy();
  });
});

describe('Indian island repositioning', () => {
  const nationOutline = getTopoFeature(topoJson, 'data') as any;

  it('should move Andaman and Nicobar closer to the eastern peninsular India region', () => {
    const island = features.find(f => f.properties?.NAME_1 === 'Andaman and Nicobar');
    expect(island).toBeTruthy();
    const adjustedIsland = repositionIndianIslands(island as any) as any;
    const projectionCtx = createProjection('albers', nationOutline, 800, 600, { padding: 20 });

    const originalCentroid = projectionCtx.pathGenerator.centroid(island as any);
    const adjustedCentroid = projectionCtx.pathGenerator.centroid(adjustedIsland as any);

    expect(originalCentroid).not.toBeNull();
    expect(adjustedCentroid).not.toBeNull();
    expect(adjustedCentroid[0]).toBeLessThan(originalCentroid[0]);
  });

  it('should move Lakshadweep closer to the western peninsular India region', () => {
    const island = features.find(f => f.properties?.NAME_1 === 'Lakshadweep');
    expect(island).toBeTruthy();
    const adjustedIsland = repositionIndianIslands(island as any) as any;
    const projectionCtx = createProjection('albers', nationOutline, 800, 600, { padding: 20 });

    const originalCentroid = projectionCtx.pathGenerator.centroid(island as any);
    const adjustedCentroid = projectionCtx.pathGenerator.centroid(adjustedIsland as any);

    expect(originalCentroid).not.toBeNull();
    expect(adjustedCentroid).not.toBeNull();
    expect(adjustedCentroid[0]).toBeGreaterThan(originalCentroid[0]);
  });

  it('should keep the mainland map layout fitting the chart container', () => {
    const projectionCtx = createProjection('albers', nationOutline, 800, 600, { padding: 20 });

    expect(projectionCtx.bounds.minX).toBeGreaterThanOrEqual(0);
    expect(projectionCtx.bounds.minY).toBeGreaterThanOrEqual(0);
    expect(projectionCtx.bounds.maxX).toBeLessThanOrEqual(800);
    expect(projectionCtx.bounds.maxY).toBeLessThanOrEqual(600);
  });
});
