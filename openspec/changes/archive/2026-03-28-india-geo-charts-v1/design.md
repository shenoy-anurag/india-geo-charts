## Context

`india-geo-charts` is a new TypeScript library for creating interactive choropleth and bubble charts for India. The package targets developers who need lightweight, customizable geo visualizations without D3 or other heavy dependencies. Users provide their own GeoJSON data, giving them control over data sources and licensing.

### Constraints
- Bundle size: < 50KB gzipped (core library)
- Zero runtime dependencies
- Support both React and vanilla TypeScript/JavaScript
- Export to PNG and SVG only

## Goals / Non-Goals

**Goals:**
- Render choropleth maps with linear color interpolation
- Render bubble charts with centroid-based positioning
- Provide interactive hover tooltips (minimal bordered box style)
- Generate legends for color scales and bubble sizes
- Support PNG and SVG export via API methods
- Enable extensive customization (colors, fonts, text, watermark)
- Provide React integration (hook + component)

**Non-Goals:**
- Built-in GeoJSON data (users provide their own)
- Zoom/pan controls (v2)
- Animation on data change (v2)
- District-level granularity (v2)
- Other export formats (PDF, HTML)
- Built-in export buttons

## Decisions

### 1. Pure SVG Rendering (no Canvas for display)
**Decision**: Use SVG DOM manipulation for rendering the map
**Rationale**: 
- Native browser API, no dependencies
- Easier styling with CSS
- Native event handling on SVG elements
- SVG is the standard for vector graphics export

**Alternatives considered**:
- Canvas: Faster for thousands of polygons, but harder to style and export

### 2. Custom Projection Implementation (no d3-geo)
**Decision**: Implement simplified Mercator and Albers projections from scratch
**Rationale**:
- d3-geo is ~15KB minified
- We only need projections for India, not worldwide
- Simplified implementations are ~2KB each
- Math is well-documented (Wikipedia)

**Alternatives considered**:
- d3-geo: Too heavy, we don't need full functionality
- topojson-client: Not needed since users provide GeoJSON

### 3. Custom Color Scales (no d3-scale)
**Decision**: Implement linear interpolation and quantile scales
**Rationale**:
- d3-scale is ~8KB minified
- Only linear + quantile needed for choropleth
- Implementation is straightforward

**Alternatives considered**:
- d3-scale: Overkill for our use case
- chroma.js: Another library dependency

### 4. PNG Export via Canvas 2D
**Decision**: Use SVG serialization → Canvas → toBlob()
**Rationale**:
- Native browser API
- No html2canvas dependency
- Works reliably for SVG content

### 5. API Method for Export (no built-in button)
**Decision**: Export triggered via `chart.export('png')` / `chart.export('svg')`
**Rationale**:
- Users control UI and when to export
- Reduces bundle size
- More flexible integration

### 6. User-Provided GeoJSON
**Decision**: Users pass their own GeoJSON as input
**Rationale**:
- Users control data source and licensing
- Keeps package size small (~500KB-2MB for bundled GeoJSON)
- Users can filter to exclude neighboring countries

**Alternatives considered**:
- Bundled GeoJSON: Increases package size significantly
- CDN link: Requires internet connection

### 7. Minimal Bordered Tooltip
**Decision**: Simple bordered rectangle on hover
**Rationale**:
- Minimal implementation
- Works well for data display
- Positioned near cursor

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| GeoJSON format errors | Provide TypeScript types and validation |
| Projection accuracy | Use established mathematical formulas |
| Cross-browser SVG export | Test Canvas serialization on target browsers |
| Bundle size creep | Monitor with size-limit, set ceiling at 50KB |

## Open Questions

1. **Bubble positioning**: Should bubbles be placed at centroids only, or allow offset?
2. **React version support**: Target React 18+ or support React 16+?
3. **Legend format**: Vertical gradient bar vs horizontal? Default position?
