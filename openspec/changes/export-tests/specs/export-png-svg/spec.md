## ADDED Requirements

### Requirement: Export Functionality Tests
The implementation SHALL satisfy automated tests for SVG and PNG exports.

#### Scenario: SVG Export Test
- **WHEN** Vitest runs the `tests/export.test.ts` suite
- **THEN** it SHALL verify that `chart.export('svg')` returns a Promise<string> containing valid SVG markup
- **AND** it SHALL contain features with expected data attributes

#### Scenario: PNG Export Test
- **WHEN** Vitest runs the `tests/export.test.ts` suite
- **THEN** it SHALL verify that `chart.export('png')` returns a Promise<Blob>
- **AND** the blob size SHALL be greater than zero (if canvas is mocking correctly)

## ADDED Tests

- [export.test.ts](file:///Users/anurags/Projects/PersonalProjects/india-geo-charts/tests/export.test.ts)
