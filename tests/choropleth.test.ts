import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartRenderer } from '../src/core/renderer.js';
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
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it('should initialize and render a choropleth map', () => {
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

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    const path1 = container.querySelector('path[data-id="1"]');
    expect(path1).toBeTruthy();

    const fill1 = path1?.getAttribute('fill');
    expect(fill1).not.toBe('#e0e0e0');
  });

  it('should update data and change colors dynamically', () => {
    const data = createTestData({
      '1': 10,
      '2': 100,
    });

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
    });

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

  it('should show tooltip on hover', () => {
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

    const path1 = container.querySelector('path[data-id="1"]') as SVGPathElement;
    expect(path1).toBeTruthy();

    const tooltip = container.querySelector('div[style*="position: absolute"]');
    expect(tooltip).toBeTruthy();
  });

  it('should render bubble chart when chartType is bubble', () => {
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
});
