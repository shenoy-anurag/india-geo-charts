## 1. Implement Correct Mercator Projection

- [x] 1.1 Fix `mercatorProject` units: both X and Y should be in radians (X = lng * rad, Y = log(tan(pi/4 + lat_rad/2))).
- [x] 1.2 Update `createMercatorProjection` to handle centering and SVG Y-inversion correctly.

## 2. Implement Correct Albers Projection

- [x] 2.1 Rewrite `createAlbersProjection` with correct standard conic formulas.
- [x] 2.2 Fix center/parallel defaults for India (78°E, 24°N).

## 3. Verify

- [x] 3.1 Run `npm test tests/export.test.ts`.
- [x] 3.2 Manually check the SVG output dimensions to confirm it looks like a real map.
