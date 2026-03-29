## Why

The current GeoJSON-based logic is inefficient and has projection issues. TopoJSON provides a more compact representation of geometries, enabling better performance, smaller size, and correct topology preservation. Additionally, the current projection mechanism is broken and does not correctly map map data to the container. The data structure for the charts also needs an overhaul to support a clearer mapping of datasets, values to features, and explicit outlines.

## What Changes

- **Replace GeoJSON with TopoJSON**: Change the default map data format to TopoJSON, specifically using `data/ind.topo.json` for India maps.
- **Fix Default Projections**: Fix the projection math. Set Albers as the default projection while making it extensible to allow Mercator projections.
- **BREAKING**: Modify `ChartOptions.data` format. The new format will embrace an explicit datasets array structure that includes dataset labels, outlines, showOutline flags, and directly maps data values to TopoJSON features.

## Capabilities

### New Capabilities
- `topojson-rendering`: Support for loading, processing, and rendering TopoJSON files, including outline extraction.
- `map-projections`: Support for configurable and accurate map projections (Albers default, Mercator optional).

### Modified Capabilities
- `chart-data-structure`: Restructuring of the input data schema for choropleth charts (`ChartOptions.data`).

## Impact

- Topology parsing module: Introduction of logic to convert TopoJSON to renderable paths.
- Projection module: Fixes to projection mathematical functions to correctly render India and map to container.
- Type definitions: Breaking changes to `ChartOptions` and data injection structure.
- Rendering module: Modification to draw outlines and features according to the new data format.
