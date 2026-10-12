# SmiCalc operation time estimates - English review, 2026-10-06

## Scope and provenance

User-approved scope: add milling MRR, radial grooving time, and optional finished
thread length for turning and programmed travel for tapping and drilling. Tapping time includes
both descent and return. Cycle times are intervals for one operation, excluding
tool changes and positioning between holes. English first; localized apps are not
yet regenerated. All estimates follow the actual selected/overridden cutting data.

These are **planning estimates, not calibrated machine-cycle predictions**. No
machine examples were available. The cycle motion assumptions and peck-display
thresholds below are SmiCalc engineering assumptions; they are not YG-1 ratings,
statistical confidence intervals, or CNC program recommendations.

## Source evidence

- [YG-1 Dream Drills catalogue, YE-DD20](https://www.yg1.kr/storage/Catalog/etc/YE-DD20_DREAM_DRILLS.pdf):
  printed pp. 26-38 identify DH423 (3xD) and DH424 (5xD) without internal coolant,
  and DH406 (3xD), DH408 (5xD), DH421 (8xD) with internal coolant. The geometry is
  140 degrees. Printed pp. 39-40 contain cutting data, not a material-specific
  peck-cycle table. The user confirmed that SmiCut's K designation means internal
  coolant. These series are in YG's GENERAL family, primarily steel/cast iron,
  with selected stainless applications; do not interpret the timing model as a
  new endorsement of every material in the existing SmiCalc cutting-data tables.
- [YG-1, Holemaking: choosing the right tool](https://www.yg1.kr/storage/newsletter/VOL16/Mainnews.html):
  describes coolant-fed carbide drills as avoiding repeated pecking by improving
  chip evacuation. Supports continuous drilling as the default with adequate
  internal coolant; it does not supply numeric peck thresholds for these series.
- [Haas, High-Speed Peck Drilling](https://www.haascnc.com/content/dam/haascnc/ecommerce-assets/linedrawings/holemaking/modular_drill_heads/Tech_Doc_Drilling_With_High-Speed_Peck_sr_02-0060_to_02-0077.pdf):
  distinguishes short chip-breaking retracts from full withdrawal, and discusses
  gummy/long-chipping materials. Its inserted-drill parameters are **not** copied
  as solid-carbide cutting recommendations. The optional timing comparison here
  models full withdrawal, not G73 short retracts.
- User-approved revision following Timo's `SmiCalc_tider_och_peck_drilling.txt`:
  tapping/drilling use programmed travel from the workpiece surface. No automatic
  tap-chamfer or drill-point length is added. The 2 mm air approach remains only
  in the cycle estimate. Grooving shows only its time, without a timing note.

## Definitions and shared behavior

- All lengths in mm; speeds n in rpm, feed Vf in mm/min; output times in seconds.
- Drilling depth L is programmed drill-tip travel from the workpiece surface
  to the final depth, excluding any approach above the surface. No drill-point
  allowance is added; the user enters the intended tool-tip travel.
- Tapping depth L is programmed travel from the surface to the reversal point,
  excluding approach above the surface. No tap-chamfer allowance is added.
- Thread turning L is finished axial length per pass; lead-in/run-out are added
  only to the cycle estimate. Assumes the single-start pitch used by the app.
- Optional inputs start blank. Blank means no time rows and no copied time data.
  Positive dot/comma decimals are accepted. Zero, negative, junk, infinity and
  exponent strings are rejected with an inline message and aria-invalid.
- Invalid optional input hides time rows and disables copying; existing cutting
  data remains usable. Unsupported material/tool combinations never show stale
  time data. All five calculators clear new results at the start of recalculation.
- Programmed drill depth must not exceed the selected nominal 3D/5D/8D capacity.
  A depth beyond capacity suppresses time/copy and asks for a longer drill or
  smaller depth. It does not silently change the length or cutting data. Actual
  flute/usable length must still fit the tool/setup; the nominal depth limit
  remains a conservative check, without automatic geometry conversion.
- Existing speed/feed corrections remain based on the selected drill length;
  only the time/peck-display model uses the new actual depth.
- Unrounded n and Vf are used after existing recommended-feed rounding/overrides.
- Calculated times have one decimal. Positive results below 0.1 show '< 0.1 sec'.
  Cycle intervals round outwards to tenths if the upper bound is below 10 sec,
  otherwise to whole seconds, with a positive, non-collapsed display interval.
- Results, entered depths, variation notes and displayed timing assumptions are
  copied. The assumptions are available in a keyboard-accessible disclosure.

## Milling and grooving

MRR Q = ap * ae * Vf / 1000, in cm3/min. One decimal maximum, trailing zero
omitted; tiny positive values show '< 0.1 cm3/min'. No new inputs.

Grooving time = 60 H / (f n). One radial plunge at constant n at the entered
workpiece diameter, no approach/dwell/return. Existing material and insert
geometry restrictions still suppress recommendations. No new inputs. Only the
time row is shown/copied; no extra timing note or disclosure is displayed.

## Thread turning

N = actual selected number of passes, including FourCut correction or override.

```
Vf = pitch * n
cutting = 60 * L * N / Vf
approachTime = 60 * (4 * pitch) * N / Vf
returnDistance = (L + 4 * pitch + 2) * N
low = cutting + approachTime + 60 * returnDistance / 15000 + 0.15 * N
high = cutting + approachTime + 60 * returnDistance / 5000 + (0.5 + 60/n) * N
```

Assumes 3 pitches approach and 1 pitch run-out per pass. Rapid distances include
2 mm equivalent radial movement; rapid speeds 5-15 m/min are planning values.
Per-pass motion/control allowance is 0.15-0.5 sec, plus up to one spindle
revolution for synchronization. Constant RPM; no additional spring passes.

## Thread tapping (also existing TFK forming option)

```
Vf = pitch * n
tapping = 120 * L / Vf
approachTime = 240 / Vf
low = tapping + approachTime + 2*n/10000 + 0.4
high = tapping + approachTime + 2*n/3000 + 1.2
```

Same RPM down and up; 2 mm approach and 2 mm return above the surface. Equivalent
reversal/acceleration allowance 2n/a with a = 3,000-10,000 rpm/sec, plus 0.4-1.2
sec for synchronization/control. This is a lumped planning approximation, not
motion simulation. Tool reach, blind-hole bottom clearance and taper gauge depth
are not checked. The entered travel must already reflect the intended tool-tip endpoint.

## Drilling

```
travel = L
drilling = 60 * travel / Vf
approachTime = 120 / Vf
low = drilling + approachTime + 60 * (travel + 2) / 15000 + 0.5
high = drilling + approachTime + 60 * (travel + 2) / 5000 + 1.5
```

2 mm approach at feed, rapid return to 2 mm above the surface, 0.5-1.5 sec motion
and control overhead. Assumes adequate internal coolant when selected. No dwell,
extra breakthrough clearance, countersinking or multiple-hole positioning.

### When to show a peck comparison

These **advisory display thresholds are inferred**, not manufacturer-validated
requirements. They trigger an alternative time scenario and the user's text
'Peck drilling may be required depending on machine and conditions.'

1. Internal coolant: show only normal drilling. Do not prescribe pecking merely
   because 8xD is selected. Actual chip evacuation still needs to be checked.
2. Graphite and lamellar cast iron: no automatic peck comparison based on this
   model (not a guarantee that chip/dust evacuation is adequate).
3. Other materials without internal coolant: show the comparison above 3D actual
   programmed drilling depth.
4. At/above 2D without internal coolant: show it for D < 3 mm or the following
   chip-risk categories: low-carbon steel, austenitic stainless, ferritic/austenitic
   stainless, unalloyed copper, unalloyed aluminium, aluminium Si < 0.5%.

The app cannot observe chips, coolant pressure/flow or actual geometry. Continuous
boring of hardened steel/superalloys is not made safe merely by choosing peck;
existing warnings and recommendations remain unchanged.

### Optional full-retract time scenario

Lower estimate uses q = D, effective rapid 15000 mm/min and 0.3 sec per extra
retract. Upper estimate uses q = 0.5D, rapid 5000 mm/min and 0.8 sec per retract.
These peck sizes are hypothetical time scenarios, not a YG-1 CNC recommendation.

```
k = max(0, ceil(travel / q - 1e-10) - 1)   # intermediate retracts only
sumDepth = q * k * (k + 1) / 2
reentry = min(0.5, q / 2)
rapidDistance = 2 * sumDepth + (4 - reentry) * k
extra = 60 * rapidDistance / rapid + k * (60 * reentry / Vf + overhead)
peck interval = normal low + extraLow ... normal high + extraHigh
```

Full withdrawal to 2 mm above the surface each time, rapid return to re-entry
clearance, then feed through that clearance. Final withdrawal is already included
in the normal cycle. A small tolerance avoids a spurious extra peck at exact
multiples of q.

## Verification

`Translation/tools/verify_operation_estimates.mjs` tests reference values,
overrides, FourCut pass reduction, unsupported combinations, optional validation,
depth/capacity boundaries, peck branches, copied results, desktop and mobile layout.
Run with Node and Playwright; optional first argument is a screenshot directory.
English sources must remain byte-identical. Localized generation, workbook strings
and localized QA follow after the English review.
