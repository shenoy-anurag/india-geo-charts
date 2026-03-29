## 1. Setup Data & Dependencies

- [x] 1.1 Add `topojson-client` and `d3-geo` (along with their `@types`) to dependencies if not present.
- [x] 1.2 Identify, obtain, or verify `data/ind.topo.json` for India's map, ensuring the mesh and individual state features are intact.

## 2. Type Refactoring

- [x] 2.1 Update `ChartOptions` interface in `src/core/types.ts` to match the new explicit schema (`labels`, `datasets` with `label`, `outline`, `showOutline`, and `data: [{value, feature}]`).
- [x] 2.2 Export any necessary TypeScript definitions for TopoJSON consumption.

## 3. Projection & Parsing Logic

- [x] 3.1 Introduce TopoJSON conversion utilities (e.g. `topojson.feature`, `topojson.mesh`) inside a dedicated topology parsing file.
- [x] 3.2 Refactor `src/core/projection.ts` to remove manual broken arithmetic and integrate `d3.geoAlbers()` as default and `d3.geoMercator()` as optional.
- [x] 3.3 Implement an auto-scaling function inside projection logic utilizing `d3.geoPath(projection).bounds(outlineFeature)` to perfectly center and fit the mapping to the SVG boundaries.

## 4. Rendering Updates

- [x] 4.1 Refactor `src/core/renderer.ts` to parse the new `datasets` structure.
- [x] 4.2 Add logic to render the nation border outline when `showOutline` is `true` for a dataset.
- [x] 4.3 Map dataset values over features appropriately, injecting correct scaling / translations to SVG paths.

## 5. Testing & Validation

- [x] 5.1 Rewrite failing unit and integration tests (e.g., `tests/choropleth.test.ts`) to adapt to the new API schema and verify SVG boundary scaling.
- [x] 5.2 Validate projection aesthetics visually via existing application routes (e.g. India Dashboard).
