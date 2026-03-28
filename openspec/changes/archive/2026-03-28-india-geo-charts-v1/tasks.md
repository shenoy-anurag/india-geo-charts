## 1. Project Setup

- [ ] 1.1 Configure package.json for ESM + CommonJS dual output
- [ ] 1.2 Set up TypeScript configuration with strict mode
- [ ] 1.3 Create src directory structure (core/, react/, utils/)
- [ ] 1.4 Set up build scripts (tsc for types, esbuild for bundling)
- [ ] 1.5 Add .npmignore and update .gitignore

## 2. Type Definitions

- [ ] 2.1 Define IndiaGeoChartOptions interface
- [ ] 2.2 Define IndiaGeoChart class interface
- [ ] 2.3 Define ChartType, LegendPosition, ExportFormat enums
- [ ] 2.4 Define React types (useIndiaGeoChart return, IndiaMapProps)
- [ ] 2.5 Export all types from index.ts

## 3. GeoJSON & Projection Module

- [ ] 3.1 Implement GeoJSON validation and parsing
- [ ] 3.2 Implement Mercator projection (lng/lat to x/y)
- [ ] 3.3 Implement Albers projection (conic)
- [ ] 3.4 Implement SVG path data generation (M, L, Z commands)
- [ ] 3.5 Implement centroid calculation for bubbles
- [ ] 3.6 Implement fit-to-container bounds calculation

## 4. Color Scales Module

- [ ] 4.1 Implement linear color interpolation
- [ ] 4.2 Implement value-to-color mapping
- [ ] 4.3 Implement quantile scale (optional enhancement)
- [ ] 4.4 Create default color palettes

## 5. Renderer Module

- [ ] 5.1 Create SVG element with proper namespace
- [ ] 5.2 Implement path rendering from GeoJSON
- [ ] 5.3 Implement circle rendering for bubbles
- [ ] 5.4 Implement fill color application based on data
- [ ] 5.5 Implement border styling

## 6. Event Handling Module

- [ ] 6.1 Implement pointer event listeners on features
- [ ] 6.2 Implement hover state management
- [ ] 6.3 Implement click callbacks
- [ ] 6.4 Emit events for hover/click/leave

## 7. Tooltip Module

- [ ] 7.1 Create tooltip DOM element
- [ ] 7.2 Implement tooltip positioning near cursor
- [ ] 7.3 Implement tooltip content (name + value)
- [ ] 7.4 Implement value formatting callback
- [ ] 7.5 Style tooltip as minimal bordered box

## 8. Legend Module

- [ ] 8.1 Create gradient legend bar for choropleth
- [ ] 8.2 Add min/max labels to legend
- [ ] 8.3 Create size circles legend for bubble chart
- [ ] 8.4 Implement legend positioning (top-right, bottom-right)
- [ ] 8.5 Implement show/hide legend toggle

## 9. Text Annotations Module

- [ ] 9.1 Implement title rendering (positioned above map)
- [ ] 9.2 Implement subtitle rendering
- [ ] 9.3 Implement notes text (bottom-right)
- [ ] 9.4 Implement source attribution
- [ ] 9.5 Implement creator attribution
- [ ] 9.6 Implement watermark overlay for exports

## 10. Export Module

- [ ] 10.1 Implement SVG serialization
- [ ] 10.2 Implement PNG export via Canvas
- [ ] 10.3 Add background color support for PNG
- [ ] 10.4 Return Promise<Blob> for PNG
- [ ] 10.5 Return Promise<string> for SVG

## 11. IndiaGeoChart Class

- [ ] 11.1 Create IndiaGeoChart constructor
- [ ] 11.2 Initialize projection based on config
- [ ] 11.3 Initialize renderer with container
- [ ] 11.4 Implement chart.update() for data changes
- [ ] 11.5 Implement chart.export(format) method
- [ ] 11.6 Implement chart.destroy() for cleanup
- [ ] 11.7 Implement chart.on() for event listeners

## 12. React Integration

- [ ] 12.1 Create useIndiaGeoChart hook
- [ ] 12.2 Implement chart ref management
- [ ] 12.3 Handle component lifecycle (mount/unmount)
- [ ] 12.4 Create IndiaMap component
- [ ] 12.5 Export React module separately

## 13. Build & Package

- [ ] 13.1 Configure esbuild for core bundle (<50KB target)
- [ ] 13.2 Configure esbuild for React bundle
- [ ] 13.3 Generate proper declaration files (.d.ts)
- [ ] 13.4 Test with npm pack / local npm link
- [ ] 13.5 Verify bundle size with gzip

## 14. Testing

- [ ] 14.1 Create basic test suite with Vitest
- [ ] 14.2 Test projection calculations
- [ ] 14.3 Test color scale interpolation
- [ ] 14.4 Test export functionality
- [ ] 14.5 Test React hook integration

## 15. Documentation

- [ ] 15.1 Write README with installation and usage
- [ ] 15.2 Create API documentation
- [ ] 15.3 Add code examples (choropleth, bubble, export)
- [ ] 15.4 Document TypeScript types
