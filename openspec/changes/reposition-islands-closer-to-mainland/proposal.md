## Why

The default India projection currently renders Andaman and Nicobar Islands and Lakshadweep too far from the mainland, making the map harder to read and weakening visual association with peninsular India. This change improves geographic clarity by bringing both island groups closer to the rest of the country without altering the mainland projection.

## What Changes

- Modify projection transformation logic to translate Andaman and Nicobar Islands and Lakshadweep closer to peninsular India.
- Preserve the existing mainland projection behavior while adjusting island placement only.
- Update map-projection requirements and add tests for island repositioning.

## Capabilities

### New Capabilities
- `none`: no new capabilities are being introduced in this change

### Modified Capabilities
- `map-projections`: projection behavior is adjusted to reposition island groups closer to the mainland while preserving default container scaling and fit behavior.

## Impact

- Affected code: projection handling in `src/core/projection.ts` and any map-projection configuration code.
- Tests: add or update projection tests covering island repositioning.
- Documentation or examples that discuss India map layout may need notes about the island offset behavior.
