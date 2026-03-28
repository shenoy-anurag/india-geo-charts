## Why

There is no lightweight, dependency-free TypeScript library for creating interactive choropleth and bubble charts specifically for India at the state and district level. Existing solutions like D3-based libraries or generic map chart packages are either too heavy (50KB+ just for mapping), require D3 as a dependency, or don't support India-specific GeoJSON with proper projections.

## What Changes

- **New Package**: `india-geo-charts` - A TypeScript library for rendering interactive geo visualizations of India
- **Core Features**:
  - Choropleth maps with customizable color scales
  - Bubble charts with centroid-based positioning
  - State-level granularity (district-level support planned for v2)
  - Interactive tooltips on hover
  - Legend generation
  - Export to PNG and SVG formats
- **Customization Options**:
  - Colors (fill, border, hover, gradient scale)
  - Typography (title, subtitle, notes, source, creator)
  - Watermark on export
  - Legend position and formatting
- **Framework Support**:
  - Vanilla TypeScript/JavaScript (zero dependencies)
  - React integration via hook + component

## Capabilities

### New Capabilities

- `choropleth-rendering`: Choropleth map rendering with linear color interpolation
- `bubble-rendering`: Bubble chart rendering with centroid-based bubble placement
- `geojson-projection`: Mercator and Albers projection for India GeoJSON
- `interactive-tooltips`: Hover-based tooltips showing state name and value
- `legend-generation`: SVG legend generation for color scales and bubble sizes
- `export-png-svg`: Export charts to PNG (via Canvas) and SVG formats
- `react-integration`: React hook and component wrapper
- `text-annotations`: Title, subtitle, notes, source, creator, watermark

### Modified Capabilities

None - this is a new library with no existing specs to modify.

## Impact

- **New Files**: Entire `src/` directory structure for the library
- **Dependencies**: None (zero runtime dependencies)
- **Build Output**: CommonJS + ESM support, <50KB gzipped
- **Target Environments**: Browser (React + Vanilla TS/JS)
