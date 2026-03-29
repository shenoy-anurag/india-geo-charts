## MODIFIED Requirements

### Requirement: Albers Projection Support
The system SHALL use the Albers Equal Area Conic projection as the default for mapping Indian coordinates to the container SVG space.
The system SHALL also apply specialized translation offsets for island groups so that Andaman and Nicobar Islands and Lakshadweep are positioned closer to peninsular India within the rendered chart.

#### Scenario: Default container scaling
- **WHEN** initializing a chart with TopoJSON data
- **THEN** it fits the Albers projection into the bounding rectangle to maximize chart area space

#### Scenario: Reposition island groups closer to mainland
- **WHEN** the default India map projection is rendered
- **THEN** Andaman and Nicobar Islands SHALL be translated closer to the eastern coast of peninsular India
- **AND** Lakshadweep SHALL be translated closer to the western coast of peninsular India
- **AND** the mainland projection SHALL continue to fit the container dimensions appropriately
