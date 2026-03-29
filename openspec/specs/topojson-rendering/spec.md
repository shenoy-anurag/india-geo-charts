# topojson-rendering Specification

## Purpose
TBD - created by archiving change switch-to-topojson. Update Purpose after archive.
## Requirements
### Requirement: Render map boundaries from TopoJSON
The system SHALL accept a standard TopoJSON payload, decompress it using mathematical arcs, and render SVG/Canvas paths based on the requested features and meshes.

#### Scenario: Rendering states
- **WHEN** user configuration refers to a specific TopoJSON feature for India (e.g. Maharashtra)
- **THEN** it correctly generates and scales the mapped path for that feature within the container bounds

#### Scenario: Drawing the outline
- **WHEN** a dataset has `showOutline: true` and defines the `nation` mesh
- **THEN** it correctly extracts the mesh bounding path and draws a boundary without drawing the overlapping internal borders

