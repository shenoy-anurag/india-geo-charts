## Why

Ensures that the chart renderer's export functionality (SVG and PNG) and choropleth rendering are well-tested. Currently, choropleth tests exist but are not tracked in the specification, and export functionality lacks automated tests.

## What Changes

- Add a new test suite for SVG and PNG exports in `tests/export.test.ts`.
- Formally link `tests/choropleth.test.ts` to the `choropleth-rendering` specification.
- Formally link the new `tests/export.test.ts` to the `export-png-svg` specification.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `choropleth-rendering`: Add existing test coverage to the specification.
- `export-png-svg`: Add new test coverage for SVG and PNG exports to the specification.

## Impact

Adds `tests/export.test.ts`. Updates `openspec/specs/choropleth-rendering/spec.md` and `openspec/specs/export-png-svg/spec.md`.
