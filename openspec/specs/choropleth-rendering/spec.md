# choropleth-rendering Specification

## Purpose
TBD - created by archiving change india-geo-charts-v1. Update Purpose after archive.
## Requirements
### Requirement: Choropleth Map Rendering
The library SHALL render a choropleth map from GeoJSON and data values using linear color interpolation.

#### Scenario: Basic choropleth rendering
- **WHEN** user provides valid GeoJSON and data mapping
- **THEN** the library SHALL render each GeoJSON feature with a fill color based on the linear color scale
- **AND** features without data SHALL use the default fill color

#### Scenario: Linear color scale interpolation
- **WHEN** user provides a color scale (array of 2+ hex colors)
- **THEN** the library SHALL interpolate colors linearly between min and max data values
- **AND** values at exact min SHALL use the first color
- **AND** values at exact max SHALL use the last color

#### Scenario: Custom default fill color
- **WHEN** user specifies a custom default fill color
- **THEN** features without data values SHALL use that color

#### Scenario: Border styling
- **WHEN** user provides border color and width
- **THEN** each feature path SHALL have stroke and stroke-width attributes

### Requirement: Hover State Rendering
The library SHALL change the fill color of a hovered feature.

#### Scenario: Hover fill color change
- **WHEN** user hovers over a GeoJSON feature
- **THEN** the feature SHALL change to the hover fill color
- **AND** cursor SHALL be pointer

#### Scenario: Hover fill color reversion
- **WHEN** user moves cursor away from a feature
- **THEN** the feature SHALL revert to its original fill color

