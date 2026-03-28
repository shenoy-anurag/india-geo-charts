## ADDED Requirements

### Requirement: SVG Export
The library SHALL export the current chart as SVG.

#### Scenario: SVG export method
- **WHEN** user calls chart.export('svg')
- **THEN** the library SHALL serialize the SVG element
- **AND** SHALL return a Promise<string> containing valid SVG markup

#### Scenario: SVG export includes all elements
- **WHEN** SVG is exported
- **THEN** it SHALL include all rendered paths
- **AND** SHALL include legend if visible
- **AND** SHALL include title and annotations if present

### Requirement: PNG Export
The library SHALL export the current chart as PNG.

#### Scenario: PNG export method
- **WHEN** user calls chart.export('png')
- **THEN** the library SHALL create a Canvas element
- **AND** SHALL draw the SVG onto the canvas
- **AND** SHALL return a Promise<Blob>

#### Scenario: PNG export options
- **WHEN** user provides export options (width, height, backgroundColor)
- **THEN** the library SHALL use those for the PNG output

#### Scenario: PNG dimensions
- **WHEN** PNG is exported
- **THEN** the output SHALL match the configured width and height
- **OR** SHALL match the container dimensions

### Requirement: Export Trigger
The library SHALL NOT include built-in export buttons.

#### Scenario: No internal export UI
- **WHEN** user instantiates the chart
- **THEN** no export buttons SHALL be rendered
- **AND** export SHALL only be available via API methods
