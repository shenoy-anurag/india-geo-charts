## Context

The current `ChartRenderer` uses fixed default font families (mostly `sans-serif`) across its components: title, subtitle, tooltips, and legends. These are partially configurable but don't support external font loading (HDS/CDN) and don't have a unified default.

## Goals / Non-Goals

**Goals:**
- Provide a way to specify external font style sheets (e.g., Google Fonts) in `ChartOptions`.
- Centralize font family configuration so it's easy to set a "theme" font.
- Ensure all text-rendering components respect the custom font family.
- Automate the injection of font `<link>` tags into the document head.

**Non-Goals:**
- Font file hosting (the library will only support external URLs).
- Complex font-loading state management (e.g., blocking rendering until fonts are loaded), though we'll provide basic injection.
- Support for `@font-face` in CSS (users should provide the URL to a stylesheet that contains `@font-face`).

## Decisions

### 1. Enhanced `ChartOptions` Structure
We will add a `fontConfig` object to the root of `ChartOptions` (or extend existing configs).

```typescript
interface ChartOptions {
  // ... existing options ...
  fontConfig?: {
    externalFonts?: string[]; // Array of CDN URLs (Google Fonts etc.)
    defaultFamily?: string;   // Default font for all text elements
  };
}
```

### 2. Cascading Font Families
The `defaultFamily` will be used as the default value for:
- `titleConfig.fontFamily`
- `subtitleConfig.fontFamily`
- `notesConfig.fontFamily`
- `sourceConfig.fontFamily`
- `creatorConfig.fontFamily`
- `tooltip.fontFamily`
- `legend.fontFamily`

If these are explicitly provided in their respective configs, they will override the `defaultFamily`.

### 3. Automated Font Injection
In the `init` process of `ChartRenderer`, we will check for `externalFonts`. For each URL:
- Check if a `<link>` tag with that `href` already exists in `document.head`.
- If not, create and append a new `<link rel="stylesheet">`.

### 4. Renderer Updates
Update the `createText` helper and component renderers to ensure `font-family` is always set from the resolved configuration.

## Risks / Trade-offs

- **Flash of Unstyled Text (FOUT)**: Since we are injectng links at runtime, the first render might use local fallback fonts before the CDN font loads. 
- **SSR/Node Support**: `document.head` is only available in browser environments. For Node.js (e.g., when using `JSDOM` for exports), we need to ensure this logic handles the absence of `document` gracefully.
