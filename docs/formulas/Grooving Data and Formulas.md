# Grooving - Data and Formulas Used in the App

Source: `smicut cutting data app.html` (English), synchronized with
`Translation/English/smicut cutting data app-eng.html`.

## Scope and source

FourCut SQ external radial grooving only, with HC and LC grades. The source is
`FourCut - Skärhastighet och matning för utvändig spårstickning.pdf`, pages 1–2,
labelled preliminary recommended starting values. Not for axial feed or profile
turning. Stable clamping, correct centre height and coolant are recommended.

The user approved continuous width bands, PDF speed intervals, no practical feed
rounding, and an English-first release on 2026-09-24. Localization to all 19
configured language/market variants was authorized on 2026-09-26. Text is maintained
in translation-workbook rows 198–228; generated apps preserve the English formulas.

## Inputs and grade recommendations

- Same 30 canonical material categories and material factors Fm as Thread Turning.
- Workpiece diameter at the cutting location, in mm, greater than zero.
- Insert width W, freely entered from 0.4 through 3.5 mm, inclusive.
- Radial grooving depth H, greater than 0 and at most 2.0 mm (default 1.5 mm).
- FourCut SQ is fixed. HC/LC are shown as first- and second-choice recommendations; there is no grade input.
- Optional positive cutting-speed and feed-per-revolution overrides.

Comma and dot decimal input are accepted. Invalid input blocks dependent results
and copying. Values outside the width range are never clamped or extrapolated.

Use the existing `threadTurningFourCutGrades` first/second choices, displayed
exactly as in Thread Turning. Recommendations update with the material. Both
grades use the same cutting data; the PDF gives no grade-dependent correction.

## Base feed and material correction

| Width W (mm) | f0 (mm/rev) |
|---|---:|
| 0.4 <= W < 0.7 | 0.030 |
| 0.7 <= W < 1.1 | 0.040 |
| 1.1 <= W < 1.6 | 0.050 |
| 1.6 <= W < 2.5 | 0.060 |
| 2.5 <= W <= 3.5 | 0.080 |

`recommended f = f0 * Fm`, without interpolation or practical rounding.
The implementation uses scaled integer arithmetic to avoid floating-point tails.
For austenitic stainless steel and W = 2 mm: `0.060 * 0.9 = 0.054 mm/rev`.

## Cutting-speed intervals

The explicit PDF intervals are stored independently as `groovingSpeedData`.
They are not recalculated as 70% of the current threading table.
Rows follow the existing canonical material order:

| Material # | Vc min–max (m/min) |
|---:|---:|
| 1 | 105–140 |
| 2 | 85–120 |
| 3 | 75–105 |
| 4 | 70–100 |
| 5 | 50–75 |
| 6 | 40–70 |
| 7 | 20–40 |
| 8 | 15–30 |
| 9 | 90–125 |
| 10 | 70–105 |
| 11 | 70–105 |
| 12 | 55–85 |
| 13 | 90–125 |
| 14 | 65–100 |
| 15 | 55–85 |
| 16 | 40–55 |
| 17 | 35–50 |
| 18 | 20–35 |
| 19 | 55–85 |
| 20 | 40–55 |
| 21 | 35–50 |
| 22 | 105–175 |
| 23 | 90–125 |
| 24 | 40–55 |
| 25 | 350–630 |
| 26 | 280–560 |
| 27 | 210–350 |
| 28 | 140–280 |
| 29 | 35–50 |
| 30 | 210–350 |

## Results and display

- Recommended Vc = `ceil((min + max) / 2)` m/min.
- Used Vc/f = own positive value if entered, otherwise recommendation.
- Spindle speed `n = used Vc * 1000 / (pi * D)` rpm.
- Feed rate `vf = used f * n` mm/min, using unrounded n.
- Display n and vf rounded to whole units, following the existing calculators.
- Feed per revolution retains its exact calculated value; no rounding to 0.005.
- Vc overrides outside the interval show a warning. Feed overrides differing from
  the recommendation show a starting-value/rubbing warning.
- Copy includes material, FourCut SQ, both grade recommendations, diameter, width, used speed,
  used feed, spindle speed and feed rate.

The spindle speed applies at the entered diameter. This calculator does not
simulate changing diameter during the plunge, constant surface speed or RPM caps.


## Grooving depth and maximum diameter (2026-09-26)

Reference: user-supplied Maximum Grooving Diameter table and
`Links/maximum-grooving-diameter.svg`. The illustration and table appear below
NOTE at the bottom of the input column.

For 1.2 < H <= 2.0 mm:

`estimated Dmax = ceil(55.5 / (H - 1.2))` mm.

This is a user-approved empirical table fit, not a verified geometric clearance
model. All intermediate depths use the formula, without tabulated depth bands.
A machine-epsilon tolerance before ceil avoids floating-point artefacts at exact
integer results (e.g. 111 at H=1.7). No practical rounding is applied to feed.

| H (mm) | Dmax (mm) |
|---:|---:|
| 2.0 | 70 |
| 1.9 | 80 |
| 1.8 | 93 |
| 1.7 | 111 |
| 1.6 | 139 |
| 1.5 | 185 |

Examples: H=1.85 gives 86 mm, H=1.4 gives 278 mm, H=1.3 gives 555 mm.
For 0 < H <= 1.2, the model gives no diameter limit; the UI explicitly does not
claim verified unlimited clearance. No division by zero or negative limit occurs.

Depth outside (0, 2.0] is invalid and disables copying and dependent calculations.
A valid diameter strictly above Dmax produces a NOTE warning about the lower
cutting edge touching the workpiece. Equality is accepted. The warning suppresses cutting recommendations and is included in copied output
along with depth. The
estimated diameter is only shown in an exceeded-limit warning, not as a Cutting
Data result row. Depth does not change cutting speed, feed or RPM.


## Unsupported hardened steel (2026-09-26)

The canonical material `steel-hardened-hrc65` (Steel: hardened, HRC < 65)
is not recommended. Show "no recommendation" for cutting data and grade,
and explain in NOTE, following Thread Tapping. This applies to both Triangular
and FourCut in Thread Turning, and FourCut SQ in Grooving.
Own-value controls are hidden and disabled for this material; stored overrides
cannot produce cutting data. Switching to a supported material restores the
controls and normal calculations. Material-selector handoff uses the same rule.
Copy remains available for the no-recommendation report, including the NOTE;
previous numerical cutting results and grade recommendations are not copied.
Existing numeric reference tables are retained, but their HRC < 65 entries are
not used as recommendations for these two calculators. Other calculators and
material categories, including HRC < 55, are unchanged.


## Maximum insert depth by width (2026-09-26)

Source: user-supplied FourCut SQ catalogue screenshot, columns W and H.
Maximum insert depth `Hmax = min(2 * W, 2.0)` mm. This reproduces the catalogue:
W=0.4/0.5/0.6/0.7/0.8/0.9/1.0 mm gives H=0.8/1.0/1.2/1.4/1.6/1.8/2.0 mm.
All wider listed inserts permit 2.0 mm. For freely entered intermediate widths,
the app uses the same linear relation (e.g. W=0.65 gives Hmax=1.3 mm).

A valid depth above Hmax triggers a NOTE warning and replaces cutting data and
grade with "no recommendation", without changing the entered depth. Equality is accepted. The warning is included in
copied output and can appear together with the diameter-clearance warning.
The general depth range remains (0, 2.0] and material exclusions take precedence.


Invalid geometry (depth above the width-dependent maximum or diameter above
Dmax) suppresses speed, feed, RPM, feed rate and grade recommendations. Own-value
controls are hidden/disabled until geometry is valid again. Copy remains
available for this no-recommendation report, including the explanatory NOTE.
Invalid numeric inputs likewise show no recommendation; copying stays disabled
until inputs are valid. Advisory own-speed/feed warnings alone do not suppress
recommendations. Switching back to valid geometry restores normal results.

## Grooving time (2026-10-06, English review)

Adds `t = 60 * H / (used f * n)` seconds for one radial plunge, using existing
H and unrounded n/feed rate. Assumes constant RPM at the entered workpiece
diameter; excludes approach, dwell and return. No new input. Hidden for invalid
geometry or unsupported material, and cleared on every recalculation. Only the time row is shown and copied; no extra timing note, assumptions
disclosure or cycle estimate is displayed.
See [Operation Time Estimates](Operation%20Time%20Estimates.md).
