import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartRenderer } from '../src/core/renderer.js';
import * as fs from 'fs';
import * as path from 'path';

// Load GeoJSON once for all tests
const geoJsonPath = path.resolve(__dirname, '../data/in.json');
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));

// Mock PointerEvent if not available in jsdom
if (typeof window !== 'undefined' && !window.PointerEvent) {
  (window as any).PointerEvent = window.MouseEvent;
}

describe('ChartRenderer Choropleth tests with data/in.json', () => {
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
    // We'll use IDs that we know exist in the GeoJSON
    // Note: in.json features have top-level "id" property as numbers
    const data: Record<string, number> = {
      '1': 100, // Andaman and Nicobar
      '2': 200, // Telangana
      '3': 300, // Andhra Pradesh
    };

    const renderer = new ChartRenderer({
      container,
      geoJson,
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

    // The specific features must be colored
    // We check if at least one of them exists and has the expected data-id
    const path1 = container.querySelector('path[data-id="1"]');
    expect(path1).toBeTruthy();

    const fill1 = path1?.getAttribute('fill');
    expect(fill1).not.toBe('#e0e0e0'); // Should not be the default fill
  });

  it('should update data and change colors dynamically', () => {
    // Use at least two points to avoid min=max case where t is always 0
    const data = {
      '1': 10,
      '2': 100,
    };

    const renderer = new ChartRenderer({
      container,
      geoJson,
      data,
      chartType: 'choropleth',
    });

    const path1 = container.querySelector('path[data-id="1"]');
    const initialColor = path1?.getAttribute('fill');

    // Update '1' to be much larger than '2'
    renderer.update({ '1': 500, '2': 100 });
    const updatedColor = path1?.getAttribute('fill');

    expect(updatedColor).not.toBe(initialColor);
  });

  it('should show tooltip on hover', () => {
    const data = {
      '1': 100,
      '2': 200,
    };

    const renderer = new ChartRenderer({
      container,
      geoJson,
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

    // Trigger hover event
    const hoverEvent = new MouseEvent('pointerenter', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    // Use the actual path element
    path1.dispatchEvent(hoverEvent);

    // Tooltip should be visible and contain the name "Andaman and Nicobar"
    if (tooltip instanceof HTMLElement) {
      expect(tooltip.style.display).toBe('block');
      expect(tooltip.innerHTML).toContain('Andaman and Nicobar');
    }
  });

  it('should render bubble chart when chartType is bubble', () => {
    const data = {
      '1': 10,
      '2': 50,
      '3': 100,
    };

    const renderer = new ChartRenderer({
      container,
      geoJson,
      data,
      chartType: 'bubble',
      bubbleConfig: {
        minRadius: 5,
        maxRadius: 20,
        fill: '#ff0000'
      }
    });

    const circles = container.querySelectorAll('circle');
    // Instead of exact count (which depends on GeoJSON quirks), 
    // we check if we have bubbles for our data IDs
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
