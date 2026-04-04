# india-geo-charts
<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/npm/l/india-geo-charts.svg?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/india-geo-charts"><img alt="npm package badge & link" src="https://img.shields.io/npm/v/india-geo-charts.svg?style=flat-square" /></a>
  <a href="https://deno.bundlejs.com/?q=india-geo-charts"><img alt="Badge: Bundle Size Minified + gZipped" src="https://deno.bundlejs.com/?q=india-geo-charts&badge=gzip&badge-style=flat-square" /></a>
</p>

A lightweight TypeScript library for creating interactive choropleth and bubble charts for India.

## Features

- **Minimal dependencies** - d3-geo and topojson-client.
- **Small bundle** - ~17KB minified + gzipped
- **Pure SVG rendering** - Native browser SVG, no Canvas for display
- **Interactive tooltips** - Hover to see state name and values
- **Export support** - PNG and SVG export via API (PNG export is not working at the moment)
- **Customizable** - Colors, fonts (Google Fonts/CDN), titles, legends, watermarks
- **TypeScript** - Full type definitions included

## Installation

```bash
npm install india-geo-charts
```

## Quick Start

```typescript
import {
    ChartRenderer,
    type ChartData,
    type GeoFeature,
    type TopoTopology,
    getTopoFeature,
    getStates
} from "india-geo-charts";

fetch('https://cdn.jsdelivr.net/gh/shenoy-anurag/india-geo-charts@0.1.0/topofiles/india.topo.json')
    .then((r) => r.json())
    .then((india: TopoTopology) => {

    const states = getStates(india);
    const nation: GeoFeature = getTopoFeature(india, 'states') as GeoFeature;

    let container = document.getElementById("chart");

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

    // renderer.destroy()
});
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>India Geo Charts Demo</title>
  <style>
    body { margin: 0; font-family: sans-serif; }
    #chart { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script type="module" src="/src/index.ts"></script>
</body>
</html>
```

## Custom Fonts & CDN

Easily use Google Fonts or any external stylesheet for your charts.

## API

### ChartRenderer(options)

Creates a new chart instance, and renders it.

### Options

| Option                     | Type                        | Default                   | Description                |
| -------------------------- | --------------------------- | ------------------------- | -------------------------- |
| `container`                | `HTMLElement \| string`     | Required                  | Target container           |
| `topoJson`                  | `TopoJSON`                   | Required                  | TopoJSON data               |
| `data`                     | `ChartData`    | `{}`                      | Labels and Dataset     |
| `chartType`                | `'choropleth' \| 'bubble'`  | `'choropleth'`            | Chart type                 |
| `colors.scale`             | `string[]`                  | Blue scale                | Color gradient             |
| `colors.fill`              | `string`                    | `'#e0e0e0'`               | Default fill color         |
| `colors.hover`             | `string`                    | `'#333333'`               | Hover fill color           |
| `colors.border`             | `string`                    | `'#ffffff'`               | Border Color           |
| `colors.borderWidth`             | `number`                    | `1`               | Hover fill color           |
| `title`                    | `string`                    | `''`                      | Chart title                |
| `titleConfig` | `AnnotationConfig` | `{fontSize: 20, fontFamily: "'Recursive', sans-serif", color: '#333333'}` | Chart title font and color               |
| `subtitle`                 | `string`                    | `''`                      | Chart subtitle             |
| `subtitleConfig` | `AnnotationConfig` | `{fontSize: 14, fontFamily: "'Recursive', sans-serif", color: '#666666'}` | Chart subtitle font and color               |
| `source`                   | `string`                    | `''`                      | Data source attribution    |
| `sourceConfig` | `AnnotationConfig` | `{fontSize: 11, fontFamily: "'Recursive', sans-serif", color: '#999999'}` | Chart Title Font & Color |
| `creator`                  | `string`                    | `''`                      | Chart creator              |
| `creatorConfig` | `AnnotationConfig` | `{fontSize: 10, fontFamily: "'Recursive', sans-serif", color: '#1f1f1f'}` | Creator Font & Color |
| `notes`                    | `string`                    | `''`                      | Notes text (bottom-right)  |
| `notesConfig` | `AnnotationConfig` | `{fontSize: 11, fontFamily: "'Recursive', sans-serif", color: '#999999'}` | Notes Font & Color |
| `legend`                   | `LegendConfig \| false`     | `true`                    | Legend options             |
| `watermark`                | `WatermarkConfig \| false`  | `true`                    | Watermark options          |
| `formatValue`              | `(value: number) => string` | `v => v.toLocaleString()` | Value formatter            |
| `fontConfig.externalFonts` | `string[]`                  | `[]`                      | External font URLs (CDN)   |
| `fontConfig.defaultFamily` | `string`                    | `'sans-serif'`            | Global default font family |

### Methods

- `update(data)` - Update chart data
- `export('png')` - Export as PNG blob
- `export('svg')` - Export as SVG string
- `destroy()` - Cleanup chart
- `on(event, callback)` - Subscribe to events

### Events

- `'hover'` - Fires on feature hover
- `'click'` - Fires on feature click
- `'leave'` - Fires when mouse leaves feature

## License
MIT
