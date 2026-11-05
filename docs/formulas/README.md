# SmiCalc calculation references

These references describe the released **SmiCalc v1.0.0** app. Documentation
review: **2026-11-05**, against the English production source at commit
`5445f00fa9aa782789c3421d411bedaea133482c`. This review updates explanations and
release status; it does not change calculator data or certify machine performance.

The production HTML and generator's English source are identical. English and
19 generated language/market variants share the calculation behavior. The
2026-11-02 production synchronization covers all 20 app variants; earlier dates
in individual documents record the origin of a change, not an unreleased status.

## Find the relevant specification

| Feature | Reference | Current behavior |
|---|---|---|
| Thread turning | [Data and formulas](Thread%20Turning%20Data%20and%20Formulas.md) | Triangular/FourCut recommendations, material/pitch-specific pass reduction, manual overrides, three-pass infeed and four-pass catalogue exceptions |
| Time estimates | [Shared timing specification](Operation%20Time%20Estimates.md) | Turning, tapping, drilling and radial grooving; cycle bounds and optional peck comparison |
| Thread tapping | [Data and formulas](Thread%20Tapping%20Data%20and%20Formulas.md) | TT/TB and the separate TFK forming option; programmed travel; down-and-return timing |
| Grooving | [Data and formulas](Grooving%20Data%20and%20Formulas.md) | FourCut SQ external radial plunge, geometry limits, material exclusions and plunge time |
| Milling | [Data and formulas](Solid%20Carbide%20End%20Mills%20Data%20and%20Formulas.md) | Speed/feed corrections and material removal rate Q; no complete milling-cycle estimate |
| Drilling | [Data and formulas](Solid%20Carbide%20Drills%20Data%20and%20Formulas.md) | Coolant/length corrections, programmed depth limits, drilling time and cycle estimates |

## Recent behavior to preserve

- **FourCut thread turning:** calculate the base passes, apply the material/pitch
  reduction, round and retain at least four automatic passes. Valid own pass
  counts take precedence. Use the effective count in both infeed and timing.
  See the [worked comparison](Thread%20Turning%20Data%20and%20Formulas.md#worked-comparison).
- **Manual infeed:** three-pass distributions use catalogue anchors and documented
  interpolation. The two external four-pass 11 TPI catalogue exceptions for G and
  BSPT are distinct. Neither changes the timing equations.
- **Validation:** manual 1–2 passes are invalid; correction or clearing restores
  calculation. Unsupported HRC < 65 material has no threading/grooving
  recommendation. Retained historical numeric rows do not override these blocks.
- **Optional travel:** tapping/drilling use programmed travel from the surface;
  no automatic tap chamfer or drill point is added. Turning uses finished thread
  length. Empty optional fields omit timing; invalid fields disable copying.
- **Time disclosures:** cycle assumptions are available on screen. Copy includes
  entered lengths/depths and result values, but excludes those explanations.
- **Localization:** timing, MRR and minimum-pass messages are already released in
  all 20 variants. Text changes still require generator/workbook maintenance.

## Sources and limits

The implementation is in the root `smicut cutting data app.html`; update the
matching specification whenever its logic or tables change. The shared timing
specification owns the complete cycle equations and assumptions. Individual
calculator documents summarize that behavior and link to it.

Catalogue values, derived interpolation, and engineering timing assumptions are
identified separately. Some original supplier extracts and user-provided images
are provenance references and are not distributed in this public repository.
Do not present their filenames as downloadable assets.

The [minimum-bore prototype reference](../reference/Minimum%20Bore%20Diameter%20Data%20and%20Formulas.md)
is historical work outside the released app, not an additional released calculator.

## Keeping references current

When behavior changes, update the specification, its examples, the review version
and date, and relevant checks in the same change. Preserve previous source dates
when they explain provenance. Check shared statements about copying, validation,
localization and effective overrides across all affected documents.

See [development and verification](../development.md) for commands. The existing
operation-estimate verifier covers timing reference values, overrides, FourCut's
reduced pass count, optional inputs, peck branches, clipboard output and layouts.
