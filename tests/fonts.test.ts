import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartRenderer } from '../src/core/renderer.js';
import * as fs from 'fs';
import * as path from 'path';
import type { ChartData, TopoTopology } from '../src/types.js';
import { getAllFeatures, getTopoFeature } from '../src/core/topojson.js';

const topoJsonPath = path.resolve(__dirname, '../data/india.topo.json');
const topoJson = JSON.parse(fs.readFileSync(topoJsonPath, 'utf8')) as TopoTopology;
const features = getAllFeatures(topoJson);

function createTestData(values: Record<string, number>): ChartData {
  return {
    labels: ['States'],
    datasets: [{
      label: 'States',
      outline: getTopoFeature(topoJson, 'states') as any,
      showOutline: true,
      data: features.slice(0, 3).map((f, i) => {
        f.id = String(i + 1);
        return { feature: f as any, value: values[String(i + 1)] || 100 };
      })
    }]
  };
}

describe('ChartRenderer Font Customization Tests', () => {
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

  it('should inject external font links into the document head', () => {
    const data = createTestData({ '01': 100 });
    const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto&display=swap';

    new ChartRenderer({
      container,
      data,
      fontConfig: {
        externalFonts: [fontUrl],
        defaultFamily: 'Roboto'
      }
    });

    const links = Array.from(document.head.querySelectorAll('link'));
    const link = links.find(l => l.href === fontUrl);
    expect(link).toBeTruthy();
    expect(link?.getAttribute('rel')).toBe('stylesheet');
  });

  it('should inject external font links into the document head 2', () => {
    const data = createTestData({ '01': 100 });
    const fontUrl = 'https://fonts.googleapis.com/css2?family=LibreBaskerville&display=swap';

    new ChartRenderer({
      container,
      data,
      fontConfig: {
        externalFonts: [fontUrl],
        defaultFamily: 'Libre Baskerville'
      }
    });

    const links = Array.from(document.head.querySelectorAll('link'));
    const link = links.find(l => l.href === fontUrl);
    expect(link).toBeTruthy();
    expect(link?.getAttribute('rel')).toBe('stylesheet');
  });

  it('should apply defaultFamily to all text elements', async () => {
    const data = createTestData({ '01': 100 });
    new ChartRenderer({
      container,
      data,
      fontConfig: {
        defaultFamily: 'Montserrat'
      },
      title: 'Main Title',
      subtitle: 'Side Title',
      legend: { show: true }
    });

    await new Promise(r => setTimeout(r, 0));

    const title = container.querySelector('text[text-anchor="middle"]');
    expect(title?.getAttribute('font-family')).toBe('Montserrat');

    const legendLabel = container.querySelector('.legend text');
    expect(legendLabel?.getAttribute('font-family')).toBe('Montserrat');
  });

  it('should allow component-level overrides for font-family', async () => {
    const data = createTestData({ '01': 100 });
    new ChartRenderer({
      container,
      data,
      fontConfig: {
        defaultFamily: 'Roboto'
      },
      title: 'Main Title',
      titleConfig: {
        fontFamily: 'Open Sans'
      }
    });

    await new Promise(r => setTimeout(r, 0));

    const title = container.querySelector('text[text-anchor="middle"]');
    expect(title?.getAttribute('font-family')).toBe('Open Sans');
  });

  it('should apply font-weight and font-style to text elements', async () => {
    const data = createTestData({ '01': 100 });
    new ChartRenderer({
      container,
      data,
      title: 'Main Title',
      titleConfig: {
        fontWeight: 'bold',
        fontStyle: 'italic'
      }
    });

    await new Promise(r => setTimeout(r, 0));

    const title = container.querySelector('text[text-anchor="middle"]');
    expect(title?.getAttribute('font-weight')).toBe('bold');
    expect(title?.getAttribute('font-style')).toBe('italic');
  });

  it('should apply font settings to tooltips', async () => {
    const data = createTestData({ '01': 100 });
    new ChartRenderer({
      container,
      data,
      fontConfig: {
        defaultFamily: 'Lato'
      },
      tooltip: {
        fontWeight: 700,
        fontStyle: 'italic'
      }
    });

    await new Promise(r => setTimeout(r, 0));

    const tooltip = container.querySelector('div[style*="position: absolute"]') as HTMLDivElement;
    expect(tooltip.style.fontFamily).toContain('Lato');
    expect(tooltip.style.fontWeight).toBe('700');
    expect(tooltip.style.fontStyle).toBe('italic');
  });
});
