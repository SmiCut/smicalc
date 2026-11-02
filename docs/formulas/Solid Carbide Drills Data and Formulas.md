# Solid Carbide Drills - Data and Formulas Used in the App

Source file: `smicut cutting data app.html`

This document describes the cutting data logic currently used by the **Solid Carbide Drills** tab after the production-oriented update.

## 1. User Inputs

The calculator uses the same visible inputs:

1. Material to machine
2. Coolant
   - without Internal Coolant
   - with Internal Coolant
3. Drill diameter `D` in mm
4. Drill length
   - 3xD
   - 5xD
   - 8xD

The user can also enter own values for cutting speed `Vc` and feed per revolution `Fn`. If an own value is entered and is greater than 0, the app uses that own value in the final spindle speed and table feed calculations.

## 2. Input Validation and Limits

| Input | Requirement |
|---|---|
| Drill diameter `D` | Must be from 1.0 to 20.0 mm |
| 8xD drill length | Only available with internal coolant |
| 8xD drill diameter | Available up to 16.0 mm |

If 8xD is selected and coolant is changed to without internal coolant, the app automatically changes the drill length back to 3xD.

Risk warnings:

1. Drill diameters below 3.0 mm show a small-drill warning: check runout, maximum spindle speed, and chip evacuation. Reduce values if the machine cannot reach the calculated rpm.
2. 5xD without internal coolant in stainless, titanium, nickel, Inconel, or hardened steel is calculated with reduced values and a chip evacuation warning.
3. 8xD is calculated with reduced values where needed and a deep-drilling warning.

## 3. Calculation Flow

The app calculates Solid Carbide Drills in this order:

1. If no material is selected, the first material row is used as default.
2. The drill diameter is parsed with comma or dot decimal support.
3. The app validates `D` from 1.0 to 20.0 mm.
4. The app stops the calculation if 8xD is selected without internal coolant.
5. The app stops the calculation if 8xD is selected above 16.0 mm.
6. The selected material row provides `Fm` and the base `Vc` range.
7. The selected material is classified as general, stainless, superalloy, or hardened.
8. `Kvc` is selected from drill length, coolant, and material class.
9. `Vc min` and `Vc max` are multiplied by `Kvc`.
10. Recommended `Vc` is calculated from the adjusted range midpoint and rounded up.
11. `Fd` is selected or linearly interpolated from drill diameter and drill length.
12. `Kfn` is selected from material and then modified by depth/coolant rules where needed.
13. Recommended `Fn` is calculated as `Fm * Fd * Kfn` and rounded to 2 decimals.
14. Own `Vc` and own `Fn` are used only if the user entered values greater than 0.
15. Spindle speed `n` and table feed `Vf` are calculated from the used values.
16. Warning messages are shown after the result; warnings do not change the final numbers beyond the `Kfn` and `Kvc` factors already applied.

## 4. Cutting Speed

The app keeps the existing SmiCut `Vc` ranges as base material data. It then applies a cutting speed factor `Kvc` based on drill length, coolant, and material class.

```text
adjusted Vc min = Vc min * Kvc
adjusted Vc max = Vc max * Kvc
recommended Vc = ceil((adjusted Vc min + adjusted Vc max) / 2)
recommended Vc range = adjusted Vc min to adjusted Vc max
```

Material classes:

| Class | Materials |
|---|---|
| General | Steel that is not hardened, cast iron, copper, aluminium, graphite |
| Stainless | Stainless steel |
| Superalloy | Titanium, nickel, Inconel |
| Hardened | Hardened steel |

`Kvc` table:

| Drill length / coolant | General | Stainless | Superalloy | Hardened |
|---|---:|---:|---:|---:|
| 3xD without internal coolant | 1.00 | 0.95 | 0.90 | 0.90 |
| 5xD without internal coolant | 0.90 | 0.80 | 0.75 | 0.80 |
| 3xD with internal coolant | 1.15 | 1.10 | 1.00 | 1.00 |
| 5xD with internal coolant | 1.10 | 1.00 | 0.95 | 0.95 |
| 8xD with internal coolant | 1.00 | 0.90 | 0.85 | 0.85 |

The displayed range is formatted with no decimal when it is a whole number and one decimal otherwise.

## 5. Diameter Factor `Fd`

The app uses this table for diameter factor. There are separate factors for 3xD, 5xD, and 8xD.

| Drill diameter D mm | Fd 3xD | Fd 5xD | Fd 8xD |
|---:|---:|---:|---:|
| 1.0 | 0.04 | 0.03 | 0.02 |
| 1.5 | 0.06 | 0.045 | 0.035 |
| 2.0 | 0.08 | 0.06 | 0.05 |
| 2.5 | 0.10 | 0.08 | 0.065 |
| 3.0 | 0.12 | 0.10 | 0.08 |
| 4.0 | 0.14 | 0.11 | 0.10 |
| 5.0 | 0.17 | 0.14 | 0.12 |
| 6.0 | 0.20 | 0.16 | 0.14 |
| 8.0 | 0.26 | 0.21 | 0.18 |
| 10.0 | 0.34 | 0.27 | 0.24 |
| 12.0 | 0.38 | 0.30 | 0.27 |
| 14.0 | 0.41 | 0.33 | 0.29 |
| 16.0 | 0.44 | 0.35 | 0.31 |
| 18.0 | 0.46 | 0.37 | 0.32 |
| 20.0 | 0.50 | 0.40 | 0.35 |

If the entered diameter is between table rows, the app uses linear interpolation.

If the entered diameter is at or below the first row, the app uses the first row. The UI validation currently means this only matters at exactly 1.0 mm. If the entered diameter is at or above the last row, the app uses the last row. The UI validation currently limits the maximum to 20.0 mm.

## 6. Feed Correction Factor `Kfn`

The app now calculates feed per revolution as:

```text
recommended Fn = Fm * Fd * Kfn
```

Base `Kfn` table:

| Material | Kfn |
|---|---:|
| Steel low/medium/high carbon, low alloy | 1.00 |
| High alloy steel | 0.90 |
| Cast iron | 1.00 |
| Stainless, free machining | 0.85 |
| Stainless, austenitic | 0.70 |
| Stainless, ferritic and austenitic | 0.70 |
| Titanium, unalloyed | 0.75 |
| Titanium, alloyed | 0.65 |
| Nickel, unalloyed | 0.75 |
| Nickel, alloyed | 0.65 |
| Inconel 718 | 0.50 |
| Copper, brass, bronze | 1.00 |
| High strength bronze | 0.85 |
| Aluminium | 1.00 |
| Hardened steel HRC < 45 | 0.75 |
| Hardened steel HRC < 55 | 0.60 |
| Hardened steel HRC < 65 | 0.50 |
| Graphite | 1.00 |

Extra depth/coolant reductions:

| Combination | Extra Kfn |
|---|---:|
| 5xD without internal coolant in stainless, titanium, nickel, Inconel, or hardened steel | x 0.90 |
| 8xD in stainless, titanium, nickel, Inconel, or hardened steel | x 0.90 |

The recommended feed per revolution is rounded to 2 decimals before display and before it becomes the fallback calculation value.

## 7. Final Calculation Formulas

### Cutting Speed

```text
adjusted Vc min = Vc min * Kvc
adjusted Vc max = Vc max * Kvc
recommended Vc = ceil((adjusted Vc min + adjusted Vc max) / 2)
used Vc = own Vc if entered and greater than 0, otherwise recommended Vc
```

### Feed Per Revolution

```text
recommended Fn = Fm * Fd * Kfn
recommended Fn displayed = round(recommended Fn, 2)
used Fn = own Fn if entered and greater than 0, otherwise rounded recommended Fn
```

### Spindle Speed

```text
n = used Vc * 1000 / (pi * D)
```

### Table Feed

```text
Vf = used Fn * n
```

## 8. Worked Examples

### D10 medium carbon steel, 3xD without internal coolant

```text
Base Vc = 90 m/min
Kvc = 1.00
Fm = 1.1
Fd = 0.34
Kfn = 1.00
Fn = 1.1 * 0.34 * 1.00 = 0.37 mm/r
```

### D10 austenitic stainless, 3xD with internal coolant

```text
Base Vc = 38 m/min
Kvc = 1.10
recommended Vc = 42 m/min
Fm = 0.9
Fd = 0.34
Kfn = 0.70
Fn = 0.9 * 0.34 * 0.70 = 0.21 mm/r
```

### D10 Inconel 718, 5xD with internal coolant

```text
Base Vc = 25 m/min
Kvc = 0.95
recommended Vc = 24 m/min
Fm = 0.6
Fd = 0.27
Kfn = 0.50
Fn = 0.6 * 0.27 * 0.50 = 0.08 mm/r
```

### D2 medium carbon steel, 3xD without internal coolant

```text
Base Vc = 90 m/min
Fd = 0.08
Fn = 1.1 * 0.08 = 0.09 mm/r
Small-drill warning is shown because D < 3.0 mm
```

## 9. Rounding and Display Rules

| Value | Rule |
|---|---|
| Adjusted cutting speed range | `Vc min * Kvc` to `Vc max * Kvc` |
| Recommended cutting speed | `ceil((adjusted Vc min + adjusted Vc max) / 2)` |
| Recommended cutting speed range | `Vc min * Kvc` to `Vc max * Kvc` |
| Used cutting speed | Own value if greater than 0, otherwise recommended |
| Material factor `Fm` | 1 decimal, hidden in UI but used |
| Diameter factor `Fd` | 3 decimals, hidden in UI but used |
| Feed correction factor `Kfn` | Used internally, not shown as a separate row |
| Feed per revolution `Fn` | 2 decimals |
| Spindle speed | Nearest whole rpm |
| Table feed | Nearest whole mm/min |
| Decimal separator in UI | Comma |

## Programmed drilling depth and cycle times (2026-10-06, English review)

Optional Drilling depth (mm) is programmed drill-tip travel L from the workpiece
surface to the final depth, excluding approach above the surface. Blank retains
the previous cutting-data workflow without time results. Drilling time is
`60 * L / Vf` seconds using actual unrounded feed. No drill-point allowance is
added. The cycle interval adds 2 mm approach above the surface, rapid withdrawal
and motion overhead. Peck timing and its L/D display thresholds use the same L.

L above the selected nominal 3D/5D/8D capacity hides timing/disables copy with
an inline error. Selecting a shorter length, larger depth, or smaller diameter
revalidates that limit immediately. Existing drill-length-based speed/feed
corrections and material warnings remain unchanged.

Without internal coolant, deeper or higher-chip-risk applications also show a
full-retract peck-cycle comparison. Internal coolant defaults to normal drilling.
These display thresholds and cycle assumptions are SmiCalc planning estimates,
not a YG-1 peck table or recommended CNC program. No new cutting-data endorsement
is implied for material groups outside the GENERAL series catalogue scope.
All depth/time values and assumptions are included in copy output. Complete
material thresholds, interval equations, sources and limitations:
[Operation Time Estimates](Operation%20Time%20Estimates.md).
