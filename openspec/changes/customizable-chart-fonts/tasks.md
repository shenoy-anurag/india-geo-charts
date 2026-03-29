## 1. Type Definitions

- [x] 1.1 Add `FontConfig` interface to `src/types.ts` with `externalFonts?: string[]` and `defaultFamily?: string`.
- [x] 1.2 Update `IndiaGeoChartOptions` in `src/types.ts` to include `fontConfig?: FontConfig`.
- [x] 1.3 Update `AnnotationConfig`, `TooltipConfig`, and `LegendConfig` in `src/types.ts` to include `fontWeight?: string | number` and `fontStyle?: string`.

## 2. Renderer Options & Font Injection

- [x] 2.1 Update `ChartOptions` interface in `src/core/renderer.ts` to match the new types.
- [x] 2.2 Update `initOptions` in `src/core/renderer.ts` to implement cascading font defaults:
    - Use `fontConfig.defaultFamily` as the fallback for all component `fontFamily` settings.
- [x] 2.3 Implement a private `injectExternalFonts()` method in `ChartRenderer` that adds `<link>` tags to `document.head`.
- [x] 2.4 Call `injectExternalFonts()` in `ChartRenderer.init()`.

## 3. SVG Styling Implementation

- [x] 3.1 Update the `createText` helper method in `src/core/renderer.ts` to set `font-weight` and `font-style` attributes on SVG `text` elements.
- [x] 3.2 Ensure the tooltip initialization in `setupTooltip()` respects the new font properties (weight, style) via CSS.
- [x] 3.3 Update `renderAnnotations` and `renderLegend` to pass the full styling configuration to `createText`.

## 4. Testing & Documentation

- [x] 4.1 Update existing tests or add a new test in `tests/` to verify font configuration is correctly applied to the DOM/SVG.
- [x] 4.2 Add an example snippet to the README (or a new example file) showing how to use Google Fonts with the library.

## 5. Bug Fixes

- [x] 5.1 Fix "Attribute xmlns redefined" error in SVG export by ensuring `xmlns` is not set multiple times.
