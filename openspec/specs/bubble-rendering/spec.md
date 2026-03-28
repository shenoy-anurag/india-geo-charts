# bubble-rendering Specification

## Purpose
TBD - created by archiving change india-geo-charts-v1. Update Purpose after archive.
## Requirements
### Requirement: Bubble Chart Rendering
The library SHALL render bubble charts by placing circles at GeoJSON feature centroids.

#### Scenario: Basic bubble rendering
- **WHEN** user provides valid GeoJSON and data mapping
- **THEN** the library SHALL calculate the centroid of each feature
- **AND** place a circle at each centroid with radius based on data value

#### Scenario: Bubble size scaling
- **WHEN** user provides minRadius and maxRadius configuration
- **THEN** the library SHALL scale bubble sizes linearly between minRadius and maxRadius
- **AND** minimum data value SHALL map to minRadius
- **AND** maximum data value SHALL map to maxRadius

#### Scenario: Bubble color and styling
- **WHEN** bubble chart is active
- **THEN** bubbles SHALL use the configured fill color
- **AND** bubbles SHALL use the configured border color and width

#### Scenario: Bubbles without data
- **WHEN** a feature has no data value
- **THEN** that feature SHALL NOT render a bubble
- **OR** SHALL render a bubble with minRadius if configured

### Requirement: Bubble Hover Interactions
The library SHALL handle hover interactions on bubbles.

#### Scenario: Bubble hover state
- **WHEN** user hovers over a bubble
- **THEN** the bubble SHALL change to hover fill color
- **AND** cursor SHALL be pointer

#### Scenario: Bubble hover reversion
- **WHEN** user moves cursor away from a bubble
- **THEN** the bubble SHALL revert to its original fill color

