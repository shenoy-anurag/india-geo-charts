import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartRenderer, type ChartOptions } from '../src/core/renderer.js';
import * as fs from 'fs';
import * as path from 'path';
import type { ChartData, FeatureCollection, GeoFeature, TopoTopology } from '../src/types.js';
import { getAllFeatures, getDistricts as getDistrictsFeatures, getStates as getStatesFeatures, getTopoFeature } from '../src/core/topojson.js';

import * as topojson from 'topojson-client';

// Load TopoJSON once for all tests
// const topoJsonPath = path.resolve(__dirname, '../data/india-states.topo.json');
const topoJsonPath = path.resolve(__dirname, '../data/india.topo.json');
const topoJson = JSON.parse(fs.readFileSync(topoJsonPath, 'utf8')) as TopoTopology;
const allFeatures = getAllFeatures(topoJson);
const statesFeatures = getStatesFeatures(topoJson);
const districtsFeatures = getDistrictsFeatures(topoJson);

function createTestData(values: Record<string, number>): ChartData {
  return {
    labels: ['States'],
    datasets: [{
      label: 'States',
      outline: getTopoFeature(topoJson, 'states') as any,
      showOutline: true,
      data: statesFeatures
        .filter(f => f.properties?.id && values[String(f.properties.id)] !== undefined)
        .map(f => {
          // ensure the feature returned by getFeatureId matches our test keys.
          f.id = String(f.properties!.name);
          return {
            feature: f as any,
            value: values[String(f.properties!.id)]!
          };
        })
    }]
  };
}

// Mock PointerEvent if not available in jsdom
if (typeof window !== 'undefined' && !window.PointerEvent) {
  (window as any).PointerEvent = window.MouseEvent;
}

// Mock URL.createObjectURL since JSDOM doesn't support it fully
if (typeof window !== 'undefined' && !window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('ChartRenderer Export tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
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

  it('should export SVG correctly', async () => {
    const data = createTestData({
      '29': 100, // Karnataka
      '36': 200, // Telangana
    });

    console.log(data.datasets[0]?.data)

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 800,
      height: 600,
      title: 'SVG Export Test'
    });

    await new Promise(r => setTimeout(r, 0));

    const svgString = await renderer.export('svg') as string;
    expect(typeof svgString).toBe('string');
    expect(svgString).toContain('svg');

    // Count occurrences of 'xmlns="http://www.w3.org/2000/svg"'
    const xmlnsMatch = svgString.match(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g);
    expect(xmlnsMatch?.length).toBe(1); // Should appear exactly once

    expect(svgString).toContain('data-id="Karnataka"');
    expect(svgString).toContain('data-id="Telangana"');
    expect(svgString).toContain('SVG Export Test');

    // Save to data/exports for verification
    const exportPath = path.resolve(__dirname, '../data/exports/test-export.svg');
    if (!fs.existsSync(path.dirname(exportPath))) {
      fs.mkdirSync(path.dirname(exportPath), { recursive: true });
    }
    fs.writeFileSync(exportPath, svgString);
  });

  it('should export PNG correctly (mocking Image and Canvas behavior)', async () => {
    const data = createTestData({ '1': 100 });
    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 800,
      height: 600
    });

    await new Promise(r => setTimeout(r, 0));

    // Mock Image and its behavior
    const mockImage = {
      set src(value: string) {
        setTimeout(() => this.onload(), 10);
      },
      onload: () => { },
      onerror: () => { }
    };
    vi.stubGlobal('Image', vi.fn(() => mockImage));

    // Mock Canvas behavior
    const mockCanvas = {
      getContext: vi.fn(() => ({
        fillStyle: '',
        fillRect: vi.fn(),
        scale: vi.fn(),
        drawImage: vi.fn()
      })),
      toBlob: vi.fn((callback) => {
        callback(new Blob(['mock-png-data'], { type: 'image/png' }));
      }),
      width: 0,
      height: 0
    };

    // We can't spyOn document.createElement cleanly without typescript complaining
    // So we just rely on casting for standard JS mock pattern.
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as any;
      return originalCreateElement(tagName) as any;
    });

    const pngBlob = await renderer.export('png');
    expect(pngBlob).toBeInstanceOf(Blob);
    expect((pngBlob as Blob).type).toBe('image/png');
    expect((pngBlob as Blob).size).toBeGreaterThan(0);

    const exportPath = path.resolve(__dirname, '../data/exports/test-export.png');
    if (!fs.existsSync(path.dirname(exportPath))) {
      fs.mkdirSync(path.dirname(exportPath), { recursive: true });
    }
    fs.writeFileSync(exportPath, Buffer.from(await (pngBlob as Blob).arrayBuffer()));
  });

  it('should render and export using all Indian states with randomized values', async () => {
    const states = getTopoFeature(topoJson, 'states');
    // const nation = getTopoFeature(topoJson, 'districts');
    // console.log(nation)
    const nation = topojson.merge(topoJson, topoJson.objects.states.geometries);
    console.log(nation)

    const data: ChartData = {
      labels: statesFeatures.map(f => (f.properties?.name as string) || 'Unknown'),
      datasets: [{
        label: 'Indian States',
        outline: states as any,
        showOutline: true,
        data: statesFeatures.map(f => {
          // Ensure every feature has a predictable ID for testing
          const name = f.properties?.name as string;
          if (name) {
            f.id = name.toLowerCase().replace(/\s+/g, '_');
          }
          return {
            feature: f as any,
            value: Math.random() * 100
          };
        })
      }]
    };

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 1000,
      height: 800,
      title: 'All India States - Randomized Data',
      colors: {
        fill: '#ffffffb7',
        border: '#e4e5e7',
        // border: '#000000',
        borderWidth: 0.3,
        hover: '#ccc',
        scale: ['#dfefff', '#08306b']
      },
      fontConfig: {
        externalFonts: ['https://fonts.googleapis.com/css2?family=Recursive:wght@300..1000&display=swap'],
        defaultFamily: "'Recursive', sans-serif"
      },
      subtitle: 'Randomized Data',
      legend: {
        position: 'top-right'
      },
      creator: "Anurag Shenoy",
      creatorConfig: {
        fontSize: 10,
        fontFamily: "'Recursive', sans-serif",
        fontWeight: 700,
        fontStyle: null,
        color: "#000000"
      },
      source: "Open Government Data (OGD) Platform India"
    });

    await new Promise(r => setTimeout(r, 0));

    const svgString = await renderer.export('svg') as string;

    // Verify some specific states are present in the output
    expect(svgString).toContain('data-id="maharashtra"');
    expect(svgString).toContain('data-id="odisha"');
    expect(svgString).toContain('data-id="karnataka"');
    expect(svgString).toContain('All India States');

    // Save to data/exports for visual verification
    const exportPath = path.resolve(__dirname, '../data/exports/all-states-random.svg');
    if (!fs.existsSync(path.dirname(exportPath))) {
      fs.mkdirSync(path.dirname(exportPath), { recursive: true });
    }
    fs.writeFileSync(exportPath, svgString);
  });

  it('should render and export using all Indian districts with randomized values', async () => {
    const districts = getTopoFeature(topoJson, 'districts');

    const data: ChartData = {
      labels: districtsFeatures.map(f => (f.properties?.name as string) || 'Unknown'),
      datasets: [{
        label: 'Indian States',
        outline: districts as any,
        showOutline: true,
        data: districtsFeatures.map(f => {
          // Ensure every feature has a predictable ID for testing
          const name = f.properties?.name as string;
          if (name) {
            f.id = name.toLowerCase().replace(/\s+/g, '_');
          }
          return {
            feature: f as any,
            value: Math.random() * 100
          };
        })
      }]
    };

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 1000,
      height: 800,
      title: 'All India Districts - Randomized Data',
      colors: {
        fill: '#ffffffb7',
        border: '#e4e5e7',
        // border: '#000000',
        borderWidth: 0.3,
        hover: '#ccc',
        scale: ['#dfefff', '#08306b']
      },
      fontConfig: {
        externalFonts: ['https://fonts.googleapis.com/css2?family=Recursive:wght@300..1000&display=swap'],
        defaultFamily: "'Recursive', sans-serif"
      },
      subtitle: 'How did districts perform in 2026?',
      legend: {
        position: 'top-right'
      },
      creator: "Anurag Shenoy",
      creatorConfig: {
        fontSize: 10,
        fontFamily: "'Recursive', sans-serif",
        fontWeight: 700,
        fontStyle: null,
        color: "#000000"
      },
      source: "Open Government Data (OGD) Platform India"
    });

    await new Promise(r => setTimeout(r, 0));

    const svgString = await renderer.export('svg') as string;

    // Verify some specific states are present in the output
    expect(svgString).toContain('data-id="shahjahanpur"');
    expect(svgString).toContain('data-id="north_and_middle_andaman"');
    expect(svgString).toContain('data-id="ahmedabad"');
    expect(svgString).toContain('All India Districts');

    // Save to data/exports for visual verification
    const exportPath = path.resolve(__dirname, '../data/exports/all-districts-random.svg');
    if (!fs.existsSync(path.dirname(exportPath))) {
      fs.mkdirSync(path.dirname(exportPath), { recursive: true });
    }
    fs.writeFileSync(exportPath, svgString);
  });

  it('translate islands correctly even if all features are provided', async () => {
    // https://cdn.jsdelivr.net/gh/shenoy-anurag/india-geo-charts@0.0.4/topo_files/india.topo.json
    // const india = await fetch('https://cdn.jsdelivr.net/gh/shenoy-anurag/india-geo-charts@0.0.4/topo_files/india.topo.json').then((r) => r.json());

    const nation = getTopoFeature(topoJson, 'states');
    // const nation = topojson.merge(topoJson, topoJson.objects.states.geometries);
    // console.log(nation)

    const data: ChartData = {
      labels: statesFeatures.map(f => (f.properties?.name as string) || 'Unknown'),
      datasets: [{
        label: 'Indian States',
        outline: nation as any,
        showOutline: true,
        data: statesFeatures.map(f => {
          // Ensure every feature has a predictable ID for testing
          const name = f.properties?.name as string;
          if (name) {
            f.id = name.toLowerCase().replace(/\s+/g, '_');
          }
          return {
            feature: f as any,
            value: Math.random() * 100
          };
        })
      }]
    };

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 1000,
      height: 800,
      title: 'All India States - Randomized Data',
      colors: {
        fill: '#ffffffb7',
        border: '#e4e5e7',
        // border: '#000000',
        borderWidth: 0.3,
        hover: '#ccc',
        scale: ['#dfefff', '#08306b']
      },
      fontConfig: {
        externalFonts: ['https://fonts.googleapis.com/css2?family=Recursive:wght@300..1000&display=swap'],
        defaultFamily: "'Recursive', sans-serif"
      },
      subtitle: 'Randomized Data',
      legend: {
        position: 'top-right'
      },
      creator: "Anurag Shenoy",
      creatorConfig: {
        fontSize: 10,
        fontFamily: "'Recursive', sans-serif",
        fontWeight: 700,
        fontStyle: null,
        color: "#000000"
      },
      source: "Open Government Data (OGD) Platform India"
    });

    await new Promise(r => setTimeout(r, 0));

    const svgString = await renderer.export('svg') as string;

    // Verify some specific states are present in the output
    expect(svgString).toContain('data-id="maharashtra"');
    expect(svgString).toContain('data-id="odisha"');
    expect(svgString).toContain('data-id="karnataka"');
    expect(svgString).toContain('All India States');

    // Save to data/exports for visual verification
    const exportPath = path.resolve(__dirname, '../data/exports/all-states-random-translation.svg');
    if (!fs.existsSync(path.dirname(exportPath))) {
      fs.mkdirSync(path.dirname(exportPath), { recursive: true });
    }
    fs.writeFileSync(exportPath, svgString);
  });
});
