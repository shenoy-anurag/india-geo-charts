## 1. Setup

- [x] 1.1 Create `tests/export.test.ts` baseline with necessary Vitest imports.
- [x] 1.2 Verify `jsdom` and necessary mocks (PointerEvent) are in place.

## 2. Implement Export Tests

- [x] 2.1 Add test case for SVG export: verify non-empty string and presence of `path[data-id]`.
- [x] 2.2 Add test case for PNG export: verify it returns a Promise resolving to a Blob.
- [x] 2.3 Run `npm test tests/export.test.ts` to confirm functionality.
- [x] 2.4 Save exported SVG and PNG files to `data/exports/` during tests for visual verification.

## 3. Link Existing Tests to Specifications

- [x] 3.1 Verify `tests/choropleth.test.ts` passes.
- [x] 3.2 Ensure the specification deltas in `openspec/changes/export-tests/specs/` correctly reference these files.
