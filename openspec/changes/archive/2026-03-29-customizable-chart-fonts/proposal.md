## Why

Currently, the `india-geo-charts` library uses a hardcoded default font family (`sans-serif`) for most text elements (titles, subtitles, tooltips, legend, etc.). This limits the visual flexibility for users who want to match the chart's aesthetics with their branding or project design.

A frequent request is for better "rich aesthetics." Allowing users to specify custom fonts directly through `ChartOptions`, including loading fonts via CDNs (like Google Fonts), will significantly improve the library's premium feel and usability.

## What Changes

- **Update `ChartOptions`**: Introduce a list of external font URLs (CDNs) that should be loaded.
- **Enhance Font Customization**: Allow granular control over font family, size, weight, and color across all chart text components (Title, Subtitle, Notes, Source, Creator, Tooltip, Legend).
- **Global Font Styling**: Introduce a default font setting that can be overridden by specific component-level configurations.
- **Font Face Loading**: Ensure these fonts are loaded before or during rendering, especially in headless/export modes where external fonts might not be available unless explicitly handled.

## Capabilities

### New Capabilities
- `font-cdn-loading`: Capability to inject and manage external font assets (Google Fonts, CDNs) to ensure they are available for SVG rendering.

### Modified Capabilities
- `text-annotations`: Extend configuration to support more font properties (weight, style) and global font inheritance.
- `interactive-tooltips`: Allow custom font family and styling for tooltips.
- `legend-generation`: Allow custom font family and styling for the legend and its labels.

## Impact

- `src/core/renderer.ts`: Update `ChartOptions` type and `initOptions` logic. Add font loading mechanism in `createSVG` or `init`.
- `src/types.ts`: Update shared types for text configurations.
- `package.json`: This might involve no new dependencies, just standardizing how font-related options are passed.
