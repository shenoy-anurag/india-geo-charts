# react-integration Specification

## Purpose
TBD - created by archiving change india-geo-charts-v1. Update Purpose after archive.
## Requirements
### Requirement: React Hook
The library SHALL provide a React hook for integration.

#### Scenario: useIndiaGeoChart hook
- **WHEN** user calls useIndiaGeoChart with configuration
- **THEN** the hook SHALL return { chartRef, containerProps, chart }
- **AND** chartRef SHALL be a ref to attach to the container div
- **AND** containerProps SHALL be spread onto the container div

#### Scenario: Chart initialization
- **WHEN** component mounts with valid configuration
- **THEN** the chart SHALL be initialized
- **AND** the SVG SHALL be rendered into the container

#### Scenario: Chart disposal
- **WHEN** component unmounts
- **THEN** the chart SHALL be destroyed
- **AND** event listeners SHALL be cleaned up

### Requirement: React Component
The library SHALL provide a React component wrapper.

#### Scenario: IndiaMap component
- **WHEN** user renders <IndiaMap /> with configuration props
- **THEN** the component SHALL render the chart internally
- **AND** SHALL handle cleanup on unmount

#### Scenario: Component props
- **WHEN** user provides chartType, data, geoJson props
- **THEN** those SHALL be passed to the underlying chart
- **AND** changes SHALL trigger re-render

### Requirement: TypeScript Types
The library SHALL provide full TypeScript type definitions.

#### Scenario: Type exports
- **WHEN** user imports from 'india-geo-charts'
- **THEN** IndiaGeoChartOptions, IndiaGeoChart, etc. SHALL be exported
- **AND** types SHALL be accurate and complete

#### Scenario: React types
- **WHEN** user imports from 'india-geo-charts/react'
- **THEN** useIndiaGeoChart types SHALL be available
- **AND** IndiaMapProps SHALL be available

