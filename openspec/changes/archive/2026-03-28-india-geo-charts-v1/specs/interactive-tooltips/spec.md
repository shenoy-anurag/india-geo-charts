## ADDED Requirements

### Requirement: Tooltip Display on Hover
The library SHALL display a tooltip when user hovers over a feature or bubble.

#### Scenario: Tooltip appearance
- **WHEN** user hovers over a feature with data
- **THEN** a tooltip SHALL appear near the cursor
- **AND** tooltip SHALL display the feature name
- **AND** tooltip SHALL display the formatted data value

#### Scenario: Tooltip positioning
- **WHEN** tooltip is displayed
- **THEN** it SHALL be positioned near the cursor
- **AND** it SHALL stay within container bounds
- **AND** offset SHALL be configurable

#### Scenario: Tooltip styling
- **WHEN** tooltip is displayed
- **THEN** it SHALL have a minimal bordered box style
- **AND** it SHALL have a light background color
- **AND** it SHALL have configurable font size and family

### Requirement: Tooltip Content Formatting
The library SHALL format tooltip content using user-provided formatters.

#### Scenario: Custom value formatter
- **WHEN** user provides formatValue function
- **THEN** tooltip SHALL display the formatted value
- **AND** the formatter SHALL receive the numeric value
- **AND** the formatter SHALL return a string

#### Scenario: Custom tooltip content
- **WHEN** user provides tooltipContent callback
- **THEN** tooltip SHALL display the returned HTML/string
- **AND** the callback SHALL receive feature properties and value

### Requirement: Tooltip Hide
The library SHALL hide the tooltip when cursor leaves the feature.

#### Scenario: Tooltip dismissal
- **WHEN** user moves cursor away from the feature
- **THEN** the tooltip SHALL be hidden immediately

#### Scenario: Tooltip persistence
- **WHEN** cursor moves to another nearby feature
- **THEN** the tooltip SHALL update to show the new feature data
