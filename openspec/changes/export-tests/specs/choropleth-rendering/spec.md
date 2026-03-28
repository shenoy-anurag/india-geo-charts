## ADDED Requirements

### Requirement: Choropleth Rendering Tests
The implementation SHALL satisfy regression tests for choropleth rendering.

#### Scenario: Existing Choropleth Renderer Tests
- **WHEN** Vitest runs the `tests/choropleth.test.ts` suite
- **THEN** all tests SHALL pass, covering:
  - Basic rendering with manual data IDs
  - Dynamic data updates and color changes
  - Interactive tooltip behavior
  - Bubble chart switching

## ADDED Tests

- [choropleth.test.ts](file:///Users/anurags/Projects/PersonalProjects/india-geo-charts/tests/choropleth.test.ts)
