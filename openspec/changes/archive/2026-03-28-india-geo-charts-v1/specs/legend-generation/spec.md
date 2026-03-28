## ADDED Requirements

### Requirement: Choropleth Legend Generation
The library SHALL generate a color scale legend for choropleth maps.

#### Scenario: Gradient legend bar
- **WHEN** user enables showLegend
- **THEN** the library SHALL render a vertical gradient legend bar
- **AND** the gradient SHALL match the color scale
- **AND** min/max values SHALL be labeled at the ends

#### Scenario: Legend positioning
- **WHEN** user specifies legendPosition as "top-right"
- **THEN** the legend SHALL be positioned in the top-right corner
- **WHEN** user specifies legendPosition as "bottom-right"
- **THEN** the legend SHALL be positioned in the bottom-right corner

#### Scenario: Legend styling
- **WHEN** legend is rendered
- **THEN** it SHALL have configurable width and height
- **AND** it SHALL have configurable font for labels
- **AND** it SHALL have configurable background and border

### Requirement: Bubble Chart Legend Generation
The library SHALL generate a size scale legend for bubble charts.

#### Scenario: Size circles legend
- **WHEN** bubble chart is active and showLegend is enabled
- **THEN** the library SHALL render circles showing min and max sizes
- **AND** SHALL display corresponding values

#### Scenario: Legend for empty data
- **WHEN** no data is provided
- **THEN** the legend SHALL not be rendered
- **OR** SHALL show "No data" message

### Requirement: Legend Visibility Toggle
The library SHALL support hiding/showing the legend.

#### Scenario: Legend hidden
- **WHEN** showLegend is false
- **THEN** no legend SHALL be rendered

#### Scenario: Legend shown
- **WHEN** showLegend is true or undefined
- **THEN** legend SHALL be rendered with default or configured options
