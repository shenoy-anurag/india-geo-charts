## Context

The map of India (68°E to 98°E, 8°N to 37°N) spans 30 longitudinal degrees but only 0.55 latitudinal log-radians. If they're not both converted to the same unit (radians), the map will be horizontally squished. Additionally, SVG Y increases downwards, so `max(lat)` must map to `min(y)`.

## Goals / Non-Goals

**Goals:**
- Fix `mercatorProject` and `createMercatorProjection`.
- Correct the Albers formulas for India (center ~24°N, 78°E; parallels ~12°N, ~35°N).
- Test with the same `tests/export.test.ts` to see improved outputs.

**Decisions:**
- All internal projected coordinates are in consistent units (radians for Mercator).
- Centering and scaling logic is unified across all projection types.
- The Y-axis is inverted for SVG where North = Top (minimum Y).

## Decisions

- Rewrite `src/core/projection.ts` entirely to use cleaner formulas without global side-effects.
