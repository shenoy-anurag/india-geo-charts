## Context

The current `india-geo-charts` package relies on raw GeoJSON for rendering choropleth maps of India. This setup has several fundamental issues:
1. GeoJSON representations are large and lack shared border data, making them inefficient.
2. Generating an optimized outline of the nation without rendering overlapping internal borders is difficult without topology information.
3. The current projection mechanism in `src/core/projection.ts` is entirely incorrect, failing to correctly map map coordinates to the SVG coordinate space.
4. The `ChartOptions.data` schema is ambiguous and unintuitive, lacking clear delineations for datasets, labels, outlines, and features.

## Goals / Non-Goals

**Goals:**
- Migrate data input formats from GeoJSON to TopoJSON, utilizing `data/ind.topo.json` as the default payload for Indian maps.
- Implement robust, accurate projection logic that scales shapes into their containers. Albers will be the default projection, with optional support for Mercator.
- Restructure the `ChartOptions.data` payload to include `labels`, `datasets` (with `showOutline`, `outline`), and explicit mapping of values to `features`.

**Non-Goals:**
- Writing a custom TopoJSON parser. We will rely on established libraries like `topojson-client`.
- Eliminating GeoJSON entirely; TopoJSON logic simply converts to GeoJSON at runtime before feeding data into the path generator.

## Decisions

**1. Using `topojson-client`**
We will update our internal logic to depend on `topojson-client` to parse the `ind.topo.json` structure, allowing us to easily extract the `mesh` (for the outline) and individual `features` (for the states). Re-inventing topology parsing is too complex and bug-prone.

**2. Leveraging `d3-geo` for projections**
Instead of using manual mathematical scaling equations for our projections (which are currently broken), we will leverage `d3-geo` functions like `geoAlbers()` and `geoPath()`. Using `geoPath().projection(projection).bounds(outline)` directly handles aspect-ratio-preserving fit to our SVG container size.

**3. Dataset Structure Redesign**
The new structure:
```ts
data: {
  labels: string[]; // E.g. ['Maharashtra', 'Odisha']
  datasets: [{
    label: string;
    outline: any; // Used to compute bounding box
    showOutline: boolean;
    data: [{ value: number; feature: any }] // Target feature to render
  }]
}
```
This forces the consumer to explicitly pass the map outline (`nation`) and the constituent state objects (`feature`), avoiding ambiguity and cleanly segregating logic.

## Risks / Trade-offs

- **Risk: Breaking User Contracts** → Mitigation: Update all tests, documentation, and internal dashboard pages. The change in `ChartOptions` is a major breaking API change.
- **Risk: Adding Dependencies** → Mitigation: Add `topojson-client` and `d3-geo` (if not already present), but ensure we import specifically (e.g., `d3-geo` micro-modules) to minimize package weight.
