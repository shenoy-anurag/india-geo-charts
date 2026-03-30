# india-geo-charts

A lightweight TypeScript library for creating interactive choropleth and bubble charts for India.

## Features

- **Minimal dependencies** - d3-geo and topojson-client.
- **Small bundle** - ~29KB gzipped
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
import { createChart } from 'india-geo-charts';

// Create a choropleth chart
const chart = createChart({
  container: '#map',
  geoJson: indiaStatesGeoJson,  // Your GeoJSON data
  data: {
    'Maharashtra': 123456,
    'Karnataka': 98765,
    // ... more states
  },
  chartType: 'choropleth',
  colors: {
    scale: ['#f7fbff', '#08306b']  // Color gradient
  },
  title: 'Population by State',
  source: 'Census 2021',
  showLegend: true
});

// Handle hover events
chart.on('hover', (feature, value, event) => {
  console.log(`${feature.properties.name}: ${value}`);
});

// Export to PNG
const pngBlob = await chart.export('png');

// Export to SVG
const svgString = await chart.export('svg');

// Update data
chart.update({
  'Maharashtra': 200000,
  'Karnataka': 150000
});

// Cleanup
chart.destroy();
```

## Bubble Charts

```typescript
const chart = createChart({
  container: '#map',
  geoJson: indiaGeoJson,
  data: populationData,
  chartType: 'bubble',
  bubbleConfig: {
    minRadius: 5,
    maxRadius: 40,
    fill: '#e74c3c'
  }
});
```

## Custom Fonts & CDN

Easily use Google Fonts or any external stylesheet for your charts.

```typescript
const chart = createChart({
  container: '#map',
  data: populationData,
  fontConfig: {
    // Automatically injects Google Fonts link into document head
    externalFonts: [
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap'
    ],
    // Set global default font family
    defaultFamily: 'Montserrat'
  },
  titleConfig: {
    fontSize: 24,
    fontWeight: 'bold' // Custom font weights
  },
  subtitleConfig: {
    fontStyle: 'italic' // Custom font styles
  }
});
```

## API

### createChart(options)

Creates a new chart instance.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement \| string` | Required | Target container |
| `geoJson` | `GeoJSON` | Required | GeoJSON data |
| `data` | `Record<string, number>` | `{}` | State-to-value mapping |
| `chartType` | `'choropleth' \| 'bubble'` | `'choropleth'` | Chart type |
| `colors.scale` | `string[]` | Blue scale | Color gradient |
| `colors.fill` | `string` | `'#e0e0e0'` | Default fill color |
| `colors.hover` | `string` | `'#333333'` | Hover fill color |
| `title` | `string` | `''` | Chart title |
| `subtitle` | `string` | `''` | Chart subtitle |
| `source` | `string` | `''` | Data source attribution |
| `creator` | `string` | `''` | Chart creator |
| `notes` | `string` | `''` | Notes text (bottom-right) |
| `legend` | `LegendConfig \| false` | `true` | Legend options |
| `watermark` | `WatermarkConfig \| false` | `true` | Watermark options |
| `formatValue` | `(value: number) => string` | `v => v.toLocaleString()` | Value formatter |
| `fontConfig.externalFonts` | `string[]` | `[]` | External font URLs (CDN) |
| `fontConfig.defaultFamily` | `string` | `'sans-serif'` | Global default font family |
| `titleConfig.fontWeight` | `string \| number` | `undefined` | Title font weight |
| `titleConfig.fontStyle` | `'normal' \| 'italic'` | `undefined` | Title font style |

### Methods

- `update(data)` - Update chart data
- `updateGeoJson(geoJson)` - Update GeoJSON
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
