# Thread Tapping - Data and Formulas Used in the App

Source file: `smicut cutting data app.html`

This document extracts the data and calculation logic currently used by the **Thread Tapping** tab.

## 1. User Inputs

The Thread Tapping calculator uses these inputs:

1. Material to machine
2. Thread type
3. Thread size, or manual thread diameter
4. Pitch / TPI
5. Tap type
   - `TT` - Spiral Point Taps for Through Holes
   - `TB` - Spiral Flute Taps for Blind Holes
6. Grade
   - `EC` - General Tapping
   - `PC` - Trouble-Free Tapping and Harder Materials

The user can also enter an own cutting speed.

If an own cutting speed is entered and is greater than 0, the app uses that own value in the final calculations. The recommended value remains visible, but is visually greyed.

## 2. Thread Type Data

Thread Tapping uses the shared `tapThreadProfiles` table.

| Thread type | Input mode in app | Data table used |
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

Metric fine does not have a size table in the app. The user manually enters diameter and pitch.

## 3. Thread Size Tables

The app uses these thread-size tables for preset thread sizes:

| Table | Count | First row | Last row |
|---|---:|---|---|
| `metricCoarseTapSizes` | 23 | M2, D 2 mm, pitch 0.40 | M39, D 39 mm, pitch 4.00 |
| `uncTapSizes` | 26 | No. 2-56 UNC, D 2.184 mm, 56 TPI | 2 1/2-4 UNC, D 63.500 mm, 4 TPI |
| `unfTapSizes` | 22 | No. 2-64 UNF, D 2.184 mm, 64 TPI | 1 1/2-12 UNF, D 38.100 mm, 12 TPI |
| `unefTapSizes` | 22 | No. 12-32 UNEF, D 5.486 mm, 32 TPI | 1 11/16-18 UNEF, D 42.863 mm, 18 TPI |
| `bspThreadSizes` | 14 | 1/16, D 7.723 mm, 28 TPI | 2, D 59.614 mm, 11 TPI |
| `nptThreadSizes` | 13 | 1/16, D 7.938 mm, 27 TPI | 4, D 114.300 mm, 8 TPI |
| `drysealThreadSizes` | 12 | 1/16, D 7.938 mm, 27 TPI | 3, D 88.900 mm, 8 TPI |
| `pgThreadSizes` | 10 | PG 7, D 12.5 mm, pitch 1.270, 20 TPI | PG 48, D 59.3 mm, pitch 1.588, 16 TPI |

For size-table threads, the pitch field is read-only and filled from the selected size.

For manual threads:

```text
metricFine: user enters diameter and pitch in mm
unConstant: user enters diameter and TPI
gOther: user enters diameter and TPI
```

For TPI-based threads, pitch in mm is calculated as:

```text
pitch = 25.4 / TPI
```

For PG threads, the app stores both `pitch` and `tpi`, and displays the TPI value.

## 4. Tapping Speed Table

The app uses `materialData` for material names/details and `tappingData` for cutting speed ranges.

Columns:

- `EC TT`: EC grade with TT tap
- `EC TB`: EC grade with TB tap
- `PC TT`: PC grade with TT tap
- `PC TB`: PC grade with TB tap

`X` means the source value is `null`, so the app shows no recommendation.

Recommended cutting speed is the midpoint of the selected range, rounded up:

```text
recommended Vc = ceil((Vc min + Vc max) / 2)
```

| # | Material | EC TT | EC TB | PC TT | PC TB | Recommended midpoint values |
|---:|---|---:|---:|---:|---:|---|
| 1 | Steel: Low carbon, C < 0.25% | 25 - 30 | 20 - 25 | 30 - 40 | 20 - 30 | 28 / 23 / 35 / 25 |
| 2 | Steel: Medium carbon, C < 0.55% | 20 - 25 | 15 - 20 | 30 - 40 | 20 - 30 | 23 / 18 / 35 / 25 |
| 3 | Steel: High carbon, C < 0.85% | 15 - 18 | 12 - 15 | 22 - 30 | 15 - 22 | 17 / 14 / 26 / 19 |
| 4 | Steel: Low alloy | 13 - 16 | 10 - 13 | 19 - 27 | 12 - 19 | 15 / 12 / 23 / 16 |
| 5 | Steel: High alloy | X | X | 15 - 20 | 10 - 15 | X / X / 18 / 13 |
| 6 | Steel: Hardened, HRC < 45 | X | X | X | X | X / X / X / X |
| 7 | Steel: Hardened, HRC < 55 | X | X | X | X | X / X / X / X |
| 8 | Steel: Hardened, HRC < 65 | X | X | X | X | X / X / X / X |
| 9 | Cast iron: Lamellar graphite | 10 - 15 | X | 20 - 30 | 10 - 20 | 13 / X / 25 / 15 |
| 10 | Cast iron: Lamellar graphite | 15 - 20 | 10 - 15 | 20 - 30 | 10 - 20 | 18 / 13 / 25 / 15 |
| 11 | Cast iron: Nodular graphite, malleable | 10 - 15 | X | 20 - 30 | 10 - 20 | 13 / X / 25 / 15 |
| 12 | Cast iron: Nodular graphite, malleable | 15 - 20 | 10 - 15 | 20 - 30 | 10 - 20 | 18 / 13 / 25 / 15 |
| 13 | Stainless steel: Free machining | 10 - 12 | 8 - 10 | 10 - 15 | 5 - 10 | 11 / 9 / 13 / 8 |
| 14 | Stainless steel: Austenitic | 9 - 11 | 7 - 9 | 10 - 15 | 5 - 10 | 10 / 8 / 13 / 8 |
| 15 | Stainless steel: Ferritic and austenitic | 8 - 10 | 6 - 8 | 8 - 10 | 6 - 8 | 9 / 7 / 9 / 7 |
| 16 | Titanium: Unalloyed | X | X | 12 - 15 | 10 - 13 | X / X / 14 / 12 |
| 17 | Titanium: Alloyed | X | X | 5 - 8 | 2 - 5 | X / X / 7 / 4 |
| 18 | Titanium: Alloyed | X | X | X | X | X / X / X / X |
| 19 | Nickel: Unalloyed | X | X | 5 - 8 | 2 - 5 | X / X / 7 / 4 |
| 20 | Nickel: Alloyed | X | X | X | X | X / X / X / X |
| 21 | Nickel: Alloyed | X | X | X | X | X / X / X / X |
| 22 | Copper: Unalloyed | 20 - 25 | 15 - 20 | 20 - 30 | 10 - 20 | 23 / 18 / 25 / 15 |
| 23 | Copper: Brass, bronze | 20 - 25 | 15 - 20 | 20 - 30 | 10 - 20 | 23 / 18 / 25 / 15 |
| 24 | Copper: High strength bronze | 20 - 25 | 15 - 20 | 20 - 30 | 10 - 20 | 23 / 18 / 25 / 15 |
| 25 | Aluminium: Unalloyed | 20 - 25 | 15 - 20 | 20 - 30 | 10 - 20 | 23 / 18 / 25 / 15 |
| 26 | Aluminium: Alloyed, Si < 0.5% | 20 - 25 | 15 - 20 | 20 - 30 | 10 - 20 | 23 / 18 / 25 / 15 |
| 27 | Aluminium: Alloyed, Si < 10% | 20 - 25 | 15 - 20 | 20 - 30 | 10 - 20 | 23 / 18 / 25 / 15 |
| 28 | Aluminium: Alloyed, Si > 10% | 20 - 25 | 15 - 20 | 20 - 30 | 10 - 20 | 23 / 18 / 25 / 15 |
| 29 | Inconel: 718 | X | X | X | X | X / X / X / X |
| 30 | Graphite: Graphite | X | X | 15 - 20 | 10 - 15 | X / X / 18 / 13 |

## 5. Unsupported Combinations

If the selected material, grade, and tap type has `X` / `null`, the app shows:

```text
This material is not recommended for the selected tapping type and grade.
```

Final calculation values show:

```text
no recommendation
```

The copy text still includes the selected inputs and the no-recommendation result.

## 6. Final Calculation Formulas

### Cutting Speed

```text
recommended Vc = ceil((Vc min + Vc max) / 2)
used Vc = own Vc if entered and greater than 0, otherwise recommended Vc
```

If there is no speed recommendation, `used Vc` is treated as no recommendation.

### Pitch

For metric pitch-mode threads:

```text
pitch = selected or manually entered pitch
```

For TPI-mode threads:

```text
pitch = 25.4 / TPI
```

### Spindle Speed

```text
n = used Vc * 1000 / (pi * thread diameter)
```

Displayed value:

```text
spindle speed = round(n) rpm
```

### Table Feed

For tapping, table feed equals spindle speed times pitch:

```text
Vf = n * pitch
```

Displayed value:

```text
table feed = round(Vf) mm/min
```

## 7. Rounding and Display Rules

| Value | Rule |
|---|---|
| Recommended cutting speed | `ceil(midpoint)` |
| Used cutting speed | own value if greater than 0, otherwise recommended |
| Thread diameter | 1 decimal |
| Pitch | 2 decimals |
| TPI | whole number if integer, otherwise 1 decimal |
| Spindle speed | nearest whole rpm |
| Table feed | nearest whole mm/min |
| Decimal separator in UI | comma |

## 8. Worked Example From the App

Inputs:

```text
Material: Steel, Low carbon, C < 0.25%
Thread type: M - Metric coarse
Thread size: M6
Thread diameter: 6.0 mm
Pitch: 1.00 mm
Tap type: TT
Grade: EC
```

Intermediate values:

```text
Vc range = 25-30 m/min
recommended Vc = ceil((25 + 30) / 2) = 28 m/min
used Vc = 28 m/min
```

Spindle speed:

```text
n = 28 * 1000 / (pi * 6.0) = 1485 rpm
```

Table feed:

```text
Vf = 1485 * 1.00 = 1485 mm/min
```

## 9. Things Worth Checking Manually

1. Metric fine is manual diameter + pitch and does not use a size table.
2. Thread Tapping shares thread-size tables with Thread Turning, including NPT, NPTF, PG, BSP, UNC, UNF, and UNEF.
3. NPT/NPTF/PG `profileDepth` values exist in the shared size tables, but Thread Tapping does not use profile depth.
4. TPI-based threads calculate pitch as `25.4 / TPI` for table feed.
5. The app uses the rounded recommended cutting speed as the default value when no own cutting speed is entered.

## Programmed tapping depth and time estimates (2026-10-06, English review)

Optional Tapping depth (mm) is programmed axial travel L from the workpiece
surface to the reversal point, excluding approach above the surface.
`tapping time = 120 * L / (pitch * n)` seconds includes descent AND return at
equal RPM. No automatic chamfer or full-thread allowance is added for TT, TB
or TFK. Blank retains existing cutting data without timing.

The cycle estimate adds a 2 mm approach above the surface and return over that
distance, plus reversal/synchronization. The entered travel must already reflect
the intended tool-tip endpoint. Example: M10x1.5, n=600 rpm, L=20 mm gives
2.6667 sec (displayed 2.7 sec with the existing one-decimal time format).
Invalid optional input hides times/disables copying; unsupported combinations
never show stale numeric times. Times, depth and assumptions are copied.
Exact formulas: [Operation Time Estimates](Operation%20Time%20Estimates.md).
