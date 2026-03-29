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
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it('should export SVG correctly', async () => {
    const data = createTestData({
      '1': 100, // Andaman and Nicobar
      '2': 200, // Telangana
    });

    const renderer = new ChartRenderer({
      container,
      data,
      chartType: 'choropleth',
      width: 800,
      height: 600,
      title: 'SVG Export Test'
    });

    const svgString = await renderer.export('svg') as string;
    expect(typeof svgString).toBe('string');
    expect(svgString).toContain('svg');
    expect(svgString).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svgString).toContain('data-id="1"');
    expect(svgString).toContain('data-id="2"');
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

    // Mock Image and its behavior
    const mockImage = {
      set src(value: string) {
        setTimeout(() => this.onload(), 10);
      },
      onload: () => {},
      onerror: () => {}
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
});
