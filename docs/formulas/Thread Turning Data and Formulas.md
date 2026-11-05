# Thread Turning - Data and Formulas Used in the App

Reviewed against SmiCalc v1.0.0 source on 2026-11-05. Applies to English and all
19 generated language/market variants. See [reference status](README.md) for scope.

Source file: `smicut cutting data app.html`

This document extracts the data and calculation logic currently used by the **Thread Turning** tab.

## 1. User Inputs

The Thread Turning calculator uses these inputs:

1. Material to machine
2. Thread type
3. Thread size, or manual thread diameter
4. Pitch / TPI
5. Insert type
   - Triangular
   - FourCut
6. Threading type
   - External
   - Internal
7. Optional finished thread length, for time estimates
8. Optional own cutting speed and number of passes

FourCut is external only. If FourCut is selected, the app automatically selects External and disables only the Internal option.

## 2. Thread Type Data

Thread Turning reuses the same thread profile table as Thread Tapping.

| Thread type | Input mode | Data used |
|---|---|---|
| M - Metric coarse | Size table | `metricCoarseTapSizes` |
| M - Metric fine | Manual | Manual diameter + pitch |
| UNC - Unified | Size table | `uncTapSizes` |
| UNF - Unified | Size table | `unfTapSizes` |
| UNEF - Unified | Size table | `unefTapSizes` |
| UN - Constant Pitch | Manual | Manual diameter + TPI |
| G - Whitworth Pipe Thread | Size table | `bspThreadSizes` |
| G - Whitworth, other threads | Manual | Manual diameter + TPI |
| BSPT - Tapered Pipe Thread | Size table | `bspThreadSizes` |
| PG - Steel Conduit Thread DIN 40430 | Size table | `pgThreadSizes` |
| NPT - Tapered Pipe Thread | Size table | `nptThreadSizes` |
| NPTF - Tapered Pipe Thread | Size table | `drysealThreadSizes` |

For TPI-based threads, pitch in mm is calculated as:

```text
pitch = 25.4 / TPI
```

## 3. Material Data Used by Thread Turning

The app uses `materialData` for material names, hardness, tensile strength, and material factor `Fm`. Thread Turning cutting speed recommendations are stored separately as `threadTurningSpeedData`.

The recommended cutting speed is the midpoint of the Vc range, rounded up:

```text
recommended Vc = ceil((Vc min + Vc max) / 2)
```

If the user enters an own cutting speed, that own value is used instead.

| # | Material | Hardness / tensile | Vc range m/min | Fm | FourCut grade |
|---:|---|---|---:|---:|---|
| 1 | Steel: Low carbon, C < 0.25% | HB < 120, N/mm2 < 400 | 150-200 | 1.2 | 1st LC, 2nd HC |
| 2 | Steel: Medium carbon, C < 0.55% | HB < 200, N/mm2 < 700 | 120-170 | 1.1 | 1st LC, 2nd HC |
| 3 | Steel: High carbon, C < 0.85% | HB < 250, N/mm2 < 850 | 110-150 | 1.0 | 1st LC, 2nd HC |
| 4 | Steel: Low alloy | HB < 250, N/mm2 < 850 | 100-140 | 1.0 | 1st LC, 2nd HC |
| 5 | Steel: High alloy | HB < 350, N/mm2 < 1200 | 70-110 | 0.9 | 1st HC, 2nd LC |
| 6 | Steel: Hardened, HRC < 45 | - | 60-100 | 0.8 | 1st HC, 2nd LC |
| 7 | Steel: Hardened, HRC < 55 | - | 30-60 | 0.7 | 1st HC, 2nd LC |
| 8 | Steel: Hardened, HRC < 65 | - | 20-40 | 0.6 | 1st HC, 2nd LC |
| 9 | Cast iron: Lamellar graphite | HB < 150, N/mm2 < 500 | 130-180 | 1.2 | 1st LC, 2nd HC |
| 10 | Cast iron: Lamellar graphite | HB < 300, N/mm2 < 1000 | 100-150 | 1.1 | 1st LC, 2nd HC |
| 11 | Cast iron: Nodular graphite, malleable | HB < 200, N/mm2 < 700 | 100-150 | 1.0 | 1st LC, 2nd HC |
| 12 | Cast iron: Nodular graphite, malleable | HB < 300, N/mm2 < 1000 | 80-120 | 0.9 | 1st LC, 2nd HC |
| 13 | Stainless steel: Free machining | HB < 250, N/mm2 < 850 | 130-180 | 1.0 | 1st HC, 2nd LC |
| 14 | Stainless steel: Austenitic | HB < 250, N/mm2 < 850 | 90-140 | 0.9 | 1st HC, 2nd LC |
| 15 | Stainless steel: Ferritic and austenitic | HB < 300, N/mm2 < 1000 | 80-120 | 0.8 | 1st HC, 2nd LC |
| 16 | Titanium: Unalloyed | HB < 200, N/mm2 < 700 | 60-80 | 0.8 | 1st HC, 2nd LC |
| 17 | Titanium: Alloyed | HB < 270, N/mm2 < 900 | 50-70 | 0.7 | 1st HC, 2nd LC |
| 18 | Titanium: Alloyed | HB < 350, N/mm2 < 1250 | 30-50 | 0.6 | 1st HC, 2nd LC |
| 19 | Nickel: Unalloyed | HB < 150, N/mm2 < 500 | 80-120 | 0.8 | 1st LC, 2nd HC |
| 20 | Nickel: Alloyed | HB < 270, N/mm2 < 900 | 60-80 | 0.7 | 1st HC, 2nd LC |
| 21 | Nickel: Alloyed | HB < 350, N/mm2 < 1250 | 50-70 | 0.6 | 1st HC, 2nd LC |
| 22 | Copper: Unalloyed | HB < 100, N/mm2 < 350 | 150-250 | 1.0 | 1st LC, 2nd HC |
| 23 | Copper: Brass, bronze | HB < 200, N/mm2 < 700 | 130-180 | 1.0 | 1st LC, 2nd HC |
| 24 | Copper: High strength bronze | HB < 470, N/mm2 < 1500 | 60-80 | 0.8 | 1st HC, 2nd LC |
| 25 | Aluminium: Unalloyed | HB < 100, N/mm2 < 350 | 500-900 | 1.4 | 1st LC, 2nd HC |
| 26 | Aluminium: Alloyed, Si < 0.5% | HB < 150, N/mm2 < 500 | 400-800 | 1.3 | 1st LC, 2nd HC |
| 27 | Aluminium: Alloyed, Si < 10% | HB < 120, N/mm2 < 400 | 300-500 | 1.2 | 1st LC, 2nd HC |
| 28 | Aluminium: Alloyed, Si > 10% | HB < 120, N/mm2 < 400 | 200-400 | 1.1 | 1st LC, 2nd HC |
| 29 | Inconel: 718 | HB < 370 | 50-70 | 0.6 | 1st HC, 2nd LC |
| 30 | Graphite: Graphite | - | 300-500 | 1.0 | 1st LC, 2nd HC |

Triangular inserts do not use the FourCut LC/HC table. Triangular always shows:

```text
First Choice FC
```

## 4. Main Calculation Formulas

### Cutting Speed

```text
recommended Vc = ceil((Vc min + Vc max) / 2)
used Vc = own Vc if entered and greater than 0, otherwise recommended Vc
```

### Spindle Speed

```text
n = used Vc * 1000 / (pi * thread diameter)
```

Displayed value:

```text
spindle speed = round(n) rpm
```

### Profile Depth

Metric, UNC, UNF, UNEF, and UN Constant Pitch:

```text
external profile depth = 0.613 * pitch
internal profile depth = 0.541 * pitch
```

G, G other, and BSPT:

```text
profile depth = 16.256 / TPI
```

NPT, NPTF, and PG:

```text
profile depth = value from the thread size table
```

| Standard | Pitch / TPI | Profile depth |
|---|---:|---:|
| NPTF | 27 TPI | 0.649 |
| NPT | 27 TPI | 0.680 |
| NPTF | 18 TPI | 1.019 |
| NPT | 18 TPI | 1.041 |
| NPTF | 14 TPI | 1.375 |
| NPT | 14 TPI | 1.365 |
| NPTF | 11.5 TPI | 1.666 |
| NPT | 11.5 TPI | 1.675 |
| NPTF | 8 TPI | 2.430 |
| NPT | 8 TPI | 2.451 |
| PG | 1.270 mm / 20 TPI | 0.757 |
| PG | 1.411 mm / 18 TPI | 0.841 |
| PG | 1.588 mm / 16 TPI | 0.946 |

### Number of Passes

The app looks up the number of passes from a table using:

```text
pass pitch
material factor Fm
```

For normal threads:

```text
pass pitch = pitch
```

For NPT and NPTF only:

| TPI | Pass pitch used |
|---:|---:|
| 27 | 2.0 |
| 18 | 2.5 |
| 14 | 3.0 |
| 11.5 | 4.0 |
| 8 | 5.5 |

If the selected TPI is not one of those exact values, the app uses the normal calculated pitch.

The pass-count table is clamped to:

```text
pitch: 0.5 to 6.0
Fm: 0.6 to 1.4
```

If the selected pitch/Fm sits between table points, the app interpolates linearly or bilinearly. The triangular base pass count is:

```text
base passes = max(4, round(interpolated pass count))
```

If the user enters an own number of passes:

```text
used passes = min(valid integer own passes, 27), for values >= 3
```

Integer inputs above 27 use 27 passes and show the radial-infeed limit note.
Blank or fractional values fall back to the recommendation. Inputs 1 and 2 are
blocked by the minimum-pass validation described below; they do not yield times
or copyable results.

### FourCut Pass Reduction

Triangular inserts use the base pass count unchanged. FourCut applies the material-specific percentage below to that rounded base count:

```text
FourCut recommended passes = max(4, round(base passes * (1 - reduction / 100)))
```

Use the actual thread pitch in mm (25.4 / TPI for inch threads), including NPT/NPTF; their special pass pitch remains used only for the base count. Interpolate the reduction linearly between the listed pitches. Below 1.0 mm use the 1.0 mm percentage; above 3.5 mm use the 3.5 mm percentage. The supplied 0–5% ranges are represented by 2.5%. Round to the nearest integer, with halves rounded up. Automatic recommendations retain a minimum of four passes. Manual integer overrides may select three passes and are not reduced again.

Percent reductions, keyed by the app's canonical material keys:

| Material key | P1.0 | P1.25 | P1.5 | P1.75 | P2.0 | P2.5 | P3.0 | P3.5 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| steel-low-carbon | 15 | 15 | 17 | 18 | 20 | 23 | 25 | 25 |
| steel-medium-carbon | 15 | 15 | 17 | 18 | 20 | 23 | 25 | 25 |
| steel-high-carbon | 12 | 15 | 17 | 18 | 20 | 22 | 23 | 25 |
| steel-low-alloy | 12 | 15 | 17 | 18 | 20 | 22 | 23 | 25 |
| steel-high-alloy | 10 | 12 | 15 | 17 | 18 | 20 | 22 | 23 |
| steel-hardened-hrc45 | 5 | 7 | 8 | 10 | 10 | 12 | 15 | 15 |
| steel-hardened-hrc55 | 2.5 | 5 | 5 | 7 | 8 | 10 | 10 | 12 |
| steel-hardened-hrc65 | 0 | 2.5 | 5 | 5 | 5 | 7 | 8 | 10 |
| cast-iron-lamellar-hb150 | 15 | 15 | 17 | 20 | 20 | 23 | 25 | 25 |
| cast-iron-lamellar-hb300 | 12 | 15 | 17 | 18 | 20 | 22 | 23 | 25 |
| cast-iron-nodular-hb200 | 12 | 15 | 17 | 18 | 20 | 22 | 23 | 25 |
| cast-iron-nodular-hb300 | 10 | 12 | 15 | 17 | 18 | 20 | 22 | 23 |
| stainless-free-machining | 12 | 15 | 15 | 17 | 18 | 20 | 22 | 23 |
| stainless-austenitic | 10 | 10 | 12 | 15 | 15 | 18 | 20 | 20 |
| stainless-ferritic-austenitic | 8 | 10 | 12 | 12 | 15 | 17 | 18 | 20 |
| titanium-unalloyed | 8 | 8 | 10 | 10 | 12 | 15 | 15 | 17 |
| titanium-alloyed-hb270 | 5 | 7 | 8 | 10 | 10 | 12 | 15 | 15 |
| titanium-alloyed-hb350 | 5 | 5 | 7 | 8 | 10 | 10 | 12 | 15 |
| nickel-unalloyed | 8 | 10 | 10 | 12 | 15 | 15 | 17 | 18 |
| nickel-alloyed-hb270 | 5 | 7 | 8 | 10 | 10 | 12 | 15 | 15 |
| nickel-alloyed-hb350 | 5 | 5 | 7 | 8 | 10 | 10 | 12 | 15 |
| copper-unalloyed | 5 | 7 | 8 | 10 | 10 | 12 | 15 | 15 |
| copper-brass-bronze | 8 | 10 | 12 | 15 | 15 | 18 | 20 | 20 |
| copper-high-strength-bronze | 5 | 7 | 8 | 10 | 12 | 15 | 17 | 18 |
| aluminium-unalloyed | 5 | 5 | 7 | 8 | 10 | 12 | 15 | 15 |
| aluminium-alloyed-si-lt-0-5 | 5 | 7 | 8 | 10 | 10 | 12 | 15 | 15 |
| aluminium-alloyed-si-lt-10 | 5 | 7 | 8 | 10 | 12 | 15 | 17 | 18 |
| aluminium-alloyed-si-gt-10 | 5 | 5 | 7 | 8 | 10 | 12 | 15 | 15 |
| inconel-718 | 5 | 5 | 7 | 8 | 10 | 10 | 12 | 15 |
| graphite | 2.5 | 5 | 5 | 8 | 10 | 10 | 10 | 12 |

## 5. Pass Count Table

Rows are pitch in mm. Columns are material factor Fm.

| Pitch | Fm 0.6 | 0.7 | 0.8 | 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.5 | 7 | 6 | 5 | 4 | 4 | 4 | 4 | 4 | 4 |
| 0.75 | 8 | 6 | 6 | 5 | 4 | 4 | 4 | 4 | 4 |
| 1.0 | 8 | 7 | 6 | 6 | 5 | 5 | 4 | 4 | 4 |
| 1.25 | 9 | 8 | 7 | 6 | 6 | 5 | 5 | 4 | 4 |
| 1.5 | 10 | 9 | 8 | 7 | 6 | 5 | 5 | 5 | 4 |
| 1.75 | 12 | 10 | 9 | 8 | 7 | 6 | 6 | 5 | 5 |
| 2.0 | 14 | 12 | 11 | 9 | 8 | 8 | 7 | 7 | 6 |
| 2.5 | 16 | 14 | 13 | 11 | 10 | 9 | 8 | 8 | 7 |
| 3.0 | 18 | 16 | 14 | 12 | 11 | 10 | 9 | 8 | 8 |
| 3.5 | 20 | 17 | 15 | 13 | 12 | 11 | 10 | 9 | 9 |
| 4.0 | 22 | 19 | 16 | 14 | 13 | 12 | 11 | 10 | 9 |
| 4.5 | 23 | 20 | 17 | 15 | 14 | 12 | 11 | 10 | 10 |
| 5.0 | 24 | 20 | 18 | 16 | 14 | 13 | 12 | 11 | 10 |
| 5.5 | 25 | 21 | 19 | 17 | 15 | 14 | 13 | 12 | 11 |
| 6.0 | 27 | 23 | 20 | 18 | 16 | 15 | 13 | 12 | 11 |

## 6. Radial Infeed Per Pass

The app first selects an infeed percentage list based on the used number of passes.

Then each displayed infeed depth is:

```text
radial infeed for pass = profile depth * pass percentage / 100
```

Displayed infeed values use 3 decimals.

If more than 27 passes are entered, the app still shows only the 27-pass distribution.

### Infeed Percentage Table

| Passes | Percentages |
|---:|---|
| 4 | 33, 27, 22, 18 |
| 5 | 28, 24, 19, 16, 13 |
| 6 | 25, 20, 17, 15, 13, 10 |
| 7 | 22, 18, 16, 14, 12, 10, 8 |
| 8 | 20, 17, 15, 13, 11, 10, 8, 6 |
| 9 | 19, 16, 14, 12, 10, 9, 8, 7, 5 |
| 10 | 18, 15, 13, 11, 9, 8, 7, 7, 7, 5 |
| 11 | 16, 14, 12, 10, 8, 8, 8, 7, 7, 6, 4 |
| 12 | 14, 13, 11, 9, 8, 8, 8, 7, 7, 6, 5, 4 |
| 13 | 12, 11, 10, 9, 8, 8, 7, 7, 7, 6, 6, 5, 4 |
| 14 | 11, 10, 9, 9, 8, 8, 7, 7, 6, 6, 6, 5, 4, 3 |
| 15 | 11, 10, 9, 9, 8, 7, 7, 7, 6, 6, 5, 5, 4, 4, 3 |
| 16 | 11, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 3, 2 |
| 17 | 11, 10, 9, 9, 8, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 2, 2 |
| 18 | 10, 10, 8, 8, 8, 7, 6, 6, 6, 5, 5, 4, 4, 3, 4, 2, 2, 2 |
| 19 | 10, 10, 8, 8, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 3, 2, 1.5, 1.5 |
| 20 | 9, 9, 8, 8, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2, 1.5, 1.5 |
| 21 | 9, 8, 8, 7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2, 1.5, 1.5, 2 |
| 22 | 8, 8, 8, 7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2, 1.5, 1.5, 1.5, 1.5 |
| 23 | 8, 8, 7, 7, 7, 6, 6, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2, 2, 1.5, 1.5, 1.5, 1.5 |
| 24 | 8, 7, 7, 7, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 1.5, 1.5, 1.5, 1.5 |
| 25 | 8, 7, 7, 6, 6, 6, 6, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5 |
| 26 | 7, 7, 6, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5 |
| 27 | 7.5, 6.5, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5 |

## 7. Rounding and Display Rules

| Value | Rule |
|---|---|
| Recommended cutting speed | `ceil(midpoint)` |
| Used cutting speed | own value if greater than 0, otherwise recommended |
| Spindle speed | rounded to nearest whole rpm |
| Profile depth | 3 decimals, comma decimal |
| Radial infeed | 3 decimals, comma decimal |
| TPI | whole number if integer, otherwise 1 decimal |
| Pitch | 2 decimals in selected input summary |

## 8. Things Worth Checking Manually

1. Thread Turning currently uses the same Vc values as End Mills, but under the separate `threadTurningSpeedData` name so it can be changed independently later.
2. Metric fine is manual diameter + pitch and does not use a size table.
3. The infeed percentage rows do not always sum to exactly 100 because they are catalogue-style distributions. The app uses each percentage directly against profile depth.


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

## Thread length and time estimates (released)

Optional Thread length (mm) means finished axial thread length L. Blank retains
the existing calculation without time results. `cutting time = 60 * L * N /
(pitch * n)` seconds, using actual passes N after FourCut reduction or override.
Cycle-time interval includes 3 pitches approach and 1 pitch run-out per pass,
return motion and synchronization. No extra spring passes. Invalid optional
input hides times/disables copy; material exclusions still suppress times.
Times and entered thread length are copied. Cycle-time explanations and assumptions
remain in the on-screen disclosure and are excluded from clipboard output. Exact interval formulas and limitations:
[Operation Time Estimates](Operation%20Time%20Estimates.md).

## FourCut passes and machining time

FourCut's reduction is **material- and pitch-specific**, not a fixed advantage
for every application. It applies only to external thread turning. The percentage
table above uses the canonical material key and actual pitch, while the base
pass-count table uses material factor Fm and its standard-specific pass pitch.
NPT/NPTF therefore retain their special base lookup but use actual pitch for the
FourCut reduction. Unsupported HRC < 65 material remains excluded even though
historical numeric reference rows exist.

Calculation order:

1. Interpolate the base pass table and round, with at least four passes.
2. For FourCut, apply the reduction percentage to that rounded base count,
   round again, and retain at least four automatic passes.
3. Apply a valid manual pass count instead when provided; do not reduce it again.
4. Use this effective N for radial infeed and all thread-turning time estimates.

### Worked comparison

External metric thread, low-carbon steel (`steel-low-carbon`, Fm = 1.2),
pitch 2 mm, finished length 36 mm, and the same 1,000 rpm for both insert types.
No manual pass override. RPM is fixed here to isolate the effect of pass count.

| Quantity | Triangular | FourCut |
|---|---:|---:|
| Base pass count at P2.0 / Fm1.2 | 7 | 7 |
| FourCut table reduction | — | 20% |
| Effective passes N | 7 | round(7 × 0.80) = 6 |
| Cutting time = 60 × 36 × N / (2 × 1000) | 7.56 sec | 6.48 sec |
| Displayed cutting time | 7.6 sec | 6.5 sec |

Here the model gives about **14.3% less cutting time**, because the effective
count changes from seven to six. A 20% table percentage does not imply an exact
20% time saving after integer rounding. In applications where rounding or the
four-pass floor gives the same count, switching insert type gives no pass-based
time reduction. At a manual six passes for both inserts and otherwise identical
inputs, both give 6.48 sec before display rounding.

The cycle-time bounds also use N for cutting, approach, return and per-pass
allowances. They describe one operation, exclude tool changes and inter-hole
positioning, and are planning estimates rather than measured machine performance.
Changing cutting speed also changes RPM and time; compare equal inputs to isolate
pass-count effects. Full equations are in [Operation Time Estimates](Operation%20Time%20Estimates.md).

## Manual three-pass infeed (2026-10-27)

Applies only when the user manually selects exactly 3 passes, for both insert
choices. FourCut remains external-only; internal turning uses Triangular as
before. Automatic recommendations are unchanged. Distributions for 4–27 passes
remain percentage-based except for the explicit four-pass catalogue cases below.
Blank and fractional overrides use the automatic recommendation. The English
validation rule for 1 or 2 passes is documented below.

User-provided catalogue screenshot supplies these **incremental radial depths**:

| External profile | Pass 1 | Pass 2 | Pass 3 | Sum |
|---|---:|---:|---:|---:|
| Metric P1.0 | 0.24 | 0.21 | 0.18 | 0.63 |
| Metric P1.5 | 0.43 | 0.30 | 0.21 | 0.94 |
| Metric P2.0 | 0.57 | 0.40 | 0.28 | 1.25 |
| Whitworth 14 TPI | 0.55 | 0.38 | 0.25 | 1.18 |

All dimensions are mm. Exact catalogue values take precedence over the nominal
profile-depth sum; do not renormalize the external metric/Whitworth anchors.
Display and copy retain the existing three-decimal format.

For other Metric/Unified pitches, interpolate each pass linearly between the
P1.0/P1.5/P2.0 anchors. Below P1.0 scale the P1.0 row by P/1.0; above P2.0 scale
the P2.0 row by P/2.0. This avoids negative or increasing passes from extrapolation.
Internal Metric/Unified values scale the result by 0.541/0.613, using the existing
internal/external profile-depth ratio (including the same relative catalogue
allowance). No new profile-depth formula is introduced.

For G, G-other and BSPT, scale the Whitworth row by:
`actual profile depth / (16.256/14)` (equivalently 14/TPI). Existing internal and
external Whitworth profile depths are identical, so their infeed values also are.
The 14 TPI anchor must not be applied to NPT/NPTF or Unified 14 TPI threads.
For NPT, NPTF and PG, use the interpolated metric row's proportions normalized to
the existing standard-specific profile depth, for both external and internal.

Non-anchor distributions are derived estimates, not additional catalogue data.
Three-pass time calculations use N=3, and copied results use the same depths as
shown on screen. Source: user screenshot `Skärmavbild 2026-10-27 kl. 10.50.55.png`.

## Manual four-pass catalogue exceptions (2026-10-27)

When the user manually enters exactly **4 passes**, use the following exact
incremental radial depths for **external** turning with either Triangular or
FourCut. Source: user screenshot `Skärmavbild 2026-10-27 kl. 10.51.07.png`.

| Profile | TPI | Pass 1 | Pass 2 | Pass 3 | Pass 4 |
|---|---:|---:|---:|---:|---:|
| G / G-other (Whitworth parallel) | 11 | 0.55 | 0.38 | 0.32 | 0.25 |
| BSPT (tapered pipe) | 11 | 0.56 | 0.39 | 0.33 | 0.26 |

All values are mm. Do not rescale/normalize these rows to nominal profile depth.
Internal turning, other pitches/standards (including NPT/NPTF and Unified at
11 TPI), automatic recommendations, and all other pass counts retain their
existing calculations. The two rows are separate; BSPT must not use the G row.
Screen and clipboard both use these values with the existing three-decimal
format. Time estimates still use the selected count N=4; no time-model change.

## Minimum-pass validation in all languages

Manual inputs 1 and 2 retain the entered value but set aria-invalid/custom
validity, show a red border, and display "Enter at least 3 passes." in a reserved
slot immediately to the right. The slot exists before the error, including on
mobile, so the row does not grow. The radial-infeed box and its heading remain
visible; only its pass list becomes invisible/inaccessible, retaining its space.
Operation-time results also become invisible with their space retained. Copying is disabled
and its stored text cleared. Recalculation resumes when corrected or cleared.
Blank input restores the recommendation. Unsupported material retains its normal
no-recommendation behaviour. Other validation rules are unchanged.
The validation is included in every localized app. Its inline message is
maintained in translation workbook row 294 (added 2026-10-27).
