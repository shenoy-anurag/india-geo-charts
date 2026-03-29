# text-annotations Specification

## Purpose
TBD - created by archiving change india-geo-charts-v1. Update Purpose after archive.
## Requirements
### Requirement: Title and Subtitle
The library SHALL render title and subtitle text on the chart.

#### Scenario: Title rendering
- **WHEN** user provides title text
- **THEN** the library SHALL render title above the map
- **AND** title SHALL use configurable font size and family
- **AND** title SHALL be centered or left-aligned based on configuration

#### Scenario: Subtitle rendering
- **WHEN** user provides subtitle text
- **THEN** the library SHALL render subtitle below title
- **AND** subtitle SHALL use smaller font size than title

### Requirement: Notes Text
The library SHALL render notes text in the bottom-right of the map.

#### Scenario: Notes positioning
- **WHEN** user provides notes text
- **THEN** the library SHALL render notes in the bottom-right corner
- **AND** notes SHALL be smaller than subtitle
- **AND** notes SHALL have configurable font styling

### Requirement: Source Attribution
The library SHALL render source attribution on the chart.

#### Scenario: Source text rendering
- **WHEN** user provides source text
- **THEN** the library SHALL render source below the map
- **AND** source SHALL indicate data origin
- **AND** source SHALL be styled with smaller font

### Requirement: Creator Attribution
The library SHALL render creator name on the chart.

#### Scenario: Creator text rendering
- **WHEN** user provides creator text
- **THEN** the library SHALL render creator attribution
- **AND** creator SHALL be positioned near source or in a corner

### Requirement: Watermark on Export
The library SHALL optionally add a watermark to exported images.

#### Scenario: Watermark inclusion
- **WHEN** user sets watermark: true
- **AND** exports the chart
- **THEN** the exported image SHALL include watermark text
- **AND** watermark SHALL be positioned unobtrusively

#### Scenario: Watermark exclusion
- **WHEN** user sets watermark: false or undefined
- **THEN** the exported image SHALL NOT include watermark

### Requirement: Global Font Property Cascading
The text annotations SHALL use the globally configured font-family by default.

#### Scenario: Cascading font-family to title
- **WHEN** user provides `fontConfig.defaultFamily: 'Roboto'`
- **AND** `titleConfig.fontFamily` is not explicitly set
- **THEN** Title SHALL render using `'Roboto'` as its font-family.

#### Scenario: Locally overriding cascading font-family
- **WHEN** user provides `fontConfig.defaultFamily: 'Roboto'`
- **AND** `titleConfig.fontFamily: 'Montserrat'` is explicitly set
- **THEN** Title SHALL render using `'Montserrat'` as its font-family.

### Requirement: Support for Additional Font Properties
The text annotation configurations SHALL allow for more granular styling beyond size and family.

#### Scenario: Setting font weight
- **WHEN** user provides `fontWeight: 'bold'` in `titleConfig`
- **THEN** title SHALL render with `font-weight: bold` in the SVG.

#### Scenario: Setting font style
- **WHEN** user provides `fontStyle: 'italic'` in `subtitleConfig`
- **THEN** subtitle SHALL render with `font-style: italic` in the SVG.

