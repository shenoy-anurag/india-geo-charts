## ADDED Requirements

### Requirement: Albers Projection Support
The system SHALL use the Albers Equal Area Conic projection as the default for mapping Indian coordinates to the container SVG space.

#### Scenario: Default container scaling
- **WHEN** initializing a chart with TopoJSON data
- **THEN** it fits the Albers projection into the bounding rectangle to maximize chart area space

### Requirement: Extensible Projection
The system SHALL permit custom projections, including Mercator, to overwrite the default projection behavior.

#### Scenario: User configures Mercator
- **WHEN** user defines `projection: geoMercator` via config options or data
- **THEN** the map scales linearly according to the Web Mercator layout standards
