## Context

The India map currently renders Andaman and Nicobar Islands and Lakshadweep at their true geographic positions, which places them far from peninsular India and makes the chart harder to interpret. The existing projection pipeline already supports Albers and custom projections, but it does not apply any post-projection grouping or island relocation logic.

## Goals / Non-Goals

**Goals:**
- Reposition Andaman and Nicobar Islands closer to the eastern side of peninsular India.
- Reposition Lakshadweep closer to the western side of peninsular India.
- Preserve the mainland projection and container scaling behavior.
- Keep the adjustment limited to island groups and avoid changing the broader projection algorithm.

**Non-Goals:**
- Changing the underlying projection type or overall chart layout.
- Implementing arbitrary user-controlled map wrapping or multi-region projection transforms.
- Moving other non-India territories or altering feature geometry beyond translation.

## Decisions

- Apply island repositioning as a post-projection translation step rather than altering the core projection math.
  - Rationale: keeps the existing Albers projection intact and minimizes impact on mainland rendering.
  - Alternative considered: embedding offsets into projection parameters, but that would affect all coordinates and complicate container fitting.

- Identify island groups by feature metadata or known TopoJSON/GeoJSON identifiers, and translate only those groups.
  - Rationale: ensures the move is explicit and confined to Andaman and Nicobar Islands plus Lakshadweep.
  - If identifiers are not available, use country-specific fallback geometry matches.

- Keep repositioning deterministic and fixed for the default India projection, with future extensibility to expose offsets if needed.
  - Rationale: avoids adding configuration surface for this change unless a real need emerges.

## Risks / Trade-offs

- [Risk] The translated island positions may overlap other map content or appear too close to the mainland.
  → Mitigation: choose conservative offsets and add tests that verify island geometry remains distinct and contained.

- [Risk] The relocation logic could break custom projection or fitting logic if applied too early.
  → Mitigation: perform repositioning after the projection transform and before final SVG fit if necessary.

- [Risk] Hard-coded island identifiers may fail on alternate TopoJSON sources.
  → Mitigation: document the expectation and add a fallback path with feature property matching.
