## Why

The current chart renderer produces "squished and mirrored" maps. This is due to a unit mismatch between longitude (degrees) and mercator latitude (log-radians), and a missing Y-axis inversion for SVG coordinates (where north is at the top).

## What Changes

- Fix `mercatorProject` to use consistent units (radians) for both X and Y.
- Implement correct Y-axis inversion and centering logic for SVG.
- Fix `createAlbersProjection` with correct standard formulas for India.
- Remove side-effects (global variables) from the projection logic.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `geojson-projection`: Fix projection logic and aspect ratios.

## Impact

Corrects the visual representation of all charts.
