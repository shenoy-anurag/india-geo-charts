## ADDED Requirements

### Requirement: GeoJSON Input Validation
The library SHALL validate and parse GeoJSON input.

#### Scenario: Valid GeoJSON FeatureCollection
- **WHEN** user provides a valid GeoJSON FeatureCollection
- **THEN** the library SHALL parse and store the GeoJSON
- **AND** SHALL extract feature properties for matching

#### Scenario: Invalid GeoJSON handling
- **WHEN** user provides invalid GeoJSON
- **THEN** the library SHALL throw a descriptive error
- **AND** error message SHALL indicate the validation failure

### Requirement: Mercator Projection
The library SHALL project GeoJSON coordinates using Mercator projection.

#### Scenario: Mercator projection application
- **WHEN** user configures projection as "mercator"
- **THEN** the library SHALL transform GeoJSON coordinates to x/y points
- **AND** SHALL fit the result within the container dimensions

#### Scenario: Standard parallels configuration
- **WHEN** user provides standard parallels for Mercator
- **THEN** the library SHALL use those parallels for the projection

### Requirement: Albers Projection
The library SHALL project GeoJSON coordinates using Albers projection.

#### Scenario: Albers projection application
- **WHEN** user configures projection as "albers"
- **THEN** the library SHALL transform GeoJSON coordinates using Albers formula
- **AND** SHALL fit the result within the container dimensions

#### Scenario: Albers parameters
- **WHEN** user provides center, parallels, rotate configuration
- **THEN** the library SHALL use those values for the Albers projection

### Requirement: SVG Path Generation
The library SHALL convert projected coordinates to SVG path data.

#### Scenario: Polygon to SVG path
- **WHEN** GeoJSON feature has Polygon geometry
- **THEN** the library SHALL generate SVG path data with M, L, Z commands

#### Scenario: MultiPolygon to SVG path
- **WHEN** GeoJSON feature has MultiPolygon geometry
- **THEN** the library SHALL generate SVG path with all sub-polygons combined

#### Scenario: Centroid calculation
- **WHEN** bubble chart is enabled
- **THEN** the library SHALL calculate polygon centroid for bubble placement
- **AND** SHALL use the centroid x/y for circle cx/cy attributes
