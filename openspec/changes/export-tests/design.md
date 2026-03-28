## Context

The `ChartRenderer` includes `export()` functionality for generating SVG and PNG outputs. While these methods exist in the code, they are not currently covered by automated tests. Additionally, choropleth rendering tests already exist in `tests/choropleth.test.ts` but are not formally linked to the `choropleth-rendering` specification.

## Goals / Non-Goals

**Goals:**
- Implement automated tests for SVG export, verifying correct serialization and inclusion of elements (regions, labels, legend).
- Implement automated tests for PNG export, verifying correct conversion via canvas and return of a Promise<Blob>.
- Formally link existing and new tests to their respective specifications in `openspec/specs/`.

**Non-Goals:**
- Refactoring the export logic itself (unless bugs are found).
- Adding export UI to the chart components.

## Decisions

- Create `tests/export.test.ts` using Vitest, matching the established testing patterns.
- For SVG export: Verify the output is a valid SVG string and contains expected data attributes.
- For PNG export: Mock Canvas and Blob behavior if necessary, or use a bridge that works in the JSDOM environment of Vitest.
- Update `openspec/specs/choropleth-rendering/spec.md` to include a `Tests` section referencing `tests/choropleth.test.ts`.
- Update `openspec/specs/export-png-svg/spec.md` to include a `Tests` section referencing `tests/export.test.ts`.

## Risks / Trade-offs

- Testing PNG export in a headless environment (JSDOM) can be tricky as it requires canvas support. We might need `jest-canvas-mock` or equivalent for Vitest if not already present.
