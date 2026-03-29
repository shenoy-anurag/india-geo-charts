# chart-data-structure Specification

## Purpose
TBD - created by archiving change switch-to-topojson. Update Purpose after archive.
## Requirements
### Requirement: TopoJSON Structure for Maps
The system SHALL require a specific `datasets` structure under `ChartOptions.data` for maps. The data structure mandates mapping a label, indicating map bounds (`outline`), toggling its visibility, and directly associating metrics linearly with TopoFeature objects.

#### Scenario: Validating user payload
- **WHEN** user inputs a configured datasets payload
- **THEN** it accepts and correctly extracts the values alongside the feature mapping

#### Scenario: Rendering from payload
- **WHEN** mapping the items to color scales
- **THEN** it iterates the associated `.data` array, computes min/max scales properly from values, and colors each `.feature` path accordingly

