# font-cdn-loading Specification

## Purpose
Enable loading of external fonts from CDNs (e.g., Google Fonts) to be used within the chart to enhance visual aesthetics and branding.

## Requirements

### Requirement: External Font Loading
The library SHALL support loading external font stylesheets from specified URLs.

#### Scenario: Registering external font URLs
- **WHEN** user provides an array of `externalFonts` URLs in `ChartOptions`
- **THEN** the library SHALL inject a `<link rel="stylesheet">` tag for each URL into the document head
- **AND** the library SHALL NOT inject duplicate tags if the URL is already present in the head

#### Scenario: Global Font Inheritance
- **WHEN** user provides a `defaultFamily` in `ChartOptions`
- **THEN** all text components (Title, Subtitle, Tooltips, Legend, etc.) SHALL use this `defaultFamily` as their font family unless overridden by their specific configurations.

#### Scenario: Overriding Global Font
- **WHEN** a local `fontFamily` is provided (e.g., in `titleConfig`)
- **THEN** it SHALL take precedence over the `defaultFamily`.

### Requirement: Cross-Environment Loading
The font loading mechanism SHOULD handle browser environments and provide graceful fallbacks in non-browser environments.

#### Scenario: Browser environment
- **WHEN** running in a browser
- **THEN** the library SHALL use `document.head` to inject `<link>` tags.

#### Scenario: Non-browser environment (Node.js/SSR)
- **WHEN** running in a standard Node.js environment without a global `document`
- **THEN** the library SHALL NOT throw an error but continue rendering with local fonts or system defaults.
