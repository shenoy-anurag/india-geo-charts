import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { ChartRenderer, type ChartData, type GeoFeature, type TopoTopology, getTopoFeature, getStates } from 'india-geo-charts';
import { JSDOM } from 'jsdom';

// Set up DOM environment for Node.js
const dom = new JSDOM('<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>India Geo Charts Demo</title><style>body { margin: 0; font-family: sans-serif; }#chart { width: 100%; height: 100vh; }</style></head><body><div id="chart"></div></body></html>');
(globalThis as any).document = dom.window.document;
(globalThis as any).window = dom.window;
(globalThis as any).HTMLElement = dom.window.HTMLElement;
(globalThis as any).XMLSerializer = dom.window.XMLSerializer;
(globalThis as any).Blob = dom.window.Blob;

async function main() {
  const india = await fetch('https://cdn.jsdelivr.net/gh/shenoy-anurag/india-geo-charts@0.1.2/topofiles/india.topo.json').then(r => r.json() as Promise<TopoTopology>);
  const states = getStates(india);
  const nation: GeoFeature = getTopoFeature(india, 'states') as GeoFeature;
  // Node has no DOM. ChartRenderer for server-side export should work with null/undefined container.
  const container = document.getElementById('chart');
  console.log(container);

  const data: ChartData = {
    labels: states.map(f => (f.properties.name as string) || 'Unknown'),
    datasets: [{
      label: 'Indian States',
      outline: nation as any,
      showOutline: true,
      data: states.map(f => {
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
    title: 'Pizza consumption in India',
    subtitle: '% of the population eating one pizza a week?',
    colors: {
      fill: '#ffffffb7',
      border: '#e4e5e7',
      borderWidth: 0.5,
      hover: '#ccc',
      scale: ['#dfefff', '#08306b']
    },
    fontConfig: {
      externalFonts: ['https://fonts.googleapis.com/css2?family=Recursive:wght@300..1000&display=swap'],
      defaultFamily: "'Recursive', sans-serif"
    },
    legend: {
      position: 'top-right'
    },
    creator: "@pizzalover99",
    creatorConfig: {
      fontSize: 10,
      fontFamily: "'Recursive', sans-serif",
      fontWeight: 700,
      fontStyle: null,
      color: "#000000"
    },
    source: "Big Pizza Initiative (BPI), India"
  });

  const svgString = await renderer.export('svg') as string;

  const outDir = './data';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/india-pizza-consumption.svg`, svgString, 'utf8');
  console.log('saved');
}

main().catch(console.error);