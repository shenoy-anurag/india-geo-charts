# text-annotations DELTA Specification

## ADDED Requirements

### Requirement: Global Font Property Cascading
The text annotations SHALL use the globally configured font-family by default.

#### Scenario: Cascading font-family to title
- **WHEN** user provides `fontConfig.defaultFamily: 'Roboto'`
- **AND** `titleConfig.fontFamily` is not explicitly set
- **THEN** Title SHALL render using `'Roboto'` as its font-family.

#### Scenario: Locally overriding cascading font-family
- **WHEN** user provides `fontConfig.defaultFamily: 'Roboto'`
- **AND** `titleConfig.fontFamily: 'Montserrat'` is explicitly set
- **THEN** Title SHALL render using `'Montserrat'` as its font-family.

### Requirement: Support for Additional Font Properties
The text annotation configurations SHALL allow for more granular styling beyond size and family.

#### Scenario: Setting font weight
- **WHEN** user provides `fontWeight: 'bold'` in `titleConfig`
- **THEN** title SHALL render with `font-weight: bold` in the SVG.

#### Scenario: Setting font style
- **WHEN** user provides `fontStyle: 'italic'` in `subtitleConfig`
- **THEN** subtitle SHALL render with `font-style: italic` in the SVG.
