# Solid Carbide End Mills - Data and Formulas Used in the App

Source file: `smicut cutting data app.html`

This document describes the cutting data logic currently used by the **Solid Carbide End Mills** tab after the production-oriented update.

## 1. User Inputs

The calculator still uses the same inputs:

1. Material to machine
2. Cutter diameter `D` in mm
3. Number of flutes `z`
4. Axial depth of cut `ap` in mm
5. Radial width of cut `ae` in mm

The user can also enter own values for cutting speed `Vc` and feed per flute `Fz`. If an own value is entered and is greater than 0, the app uses that own value in the final spindle speed and table feed calculations.

## 2. Input Validation and Limits

| Input | Requirement |
|---|---|
| Cutter diameter `D` | Must be from 0.5 to 40.0 mm |
| Number of flutes `z` | Must be a whole number, minimum 1 |
| `ap` | Must be greater than 0 |
| `ae` | Must be greater than 0 |
| `ap / D` | Must be greater than 0 and not above 6.0 |
| `ae / D` | Must be greater than 0 and not above 1.0 |

Risk limits:

1. `ap / D > 3.0` is only calculated when `ae / D <= 0.10`.
2. `ap / D > 3.0` and `ae / D > 0.10` is stopped as outside the recommended catalogue range.
3. Full slotting or near-full slotting in difficult materials is calculated, but the app shows a stability and chip evacuation warning.
4. Deep side milling above 3.0xD is calculated, but the app shows an overhang, vibration, and chip evacuation warning.

## 3. Calculation Flow

The app calculates Solid Carbide End Mills in this order:

1. If no material is selected, the first material row is used as default.
2. Cutter diameter, flute count, `ap`, and `ae` are parsed. Comma and dot decimals are supported for decimal fields.
3. The app validates `D` from 0.5 to 40.0 mm.
4. The app validates `z` as a whole number of 1 or higher.
5. The app validates `ap > 0` and `ae > 0`.
6. The app calculates `apRatio = ap / D` and `aeRatio = ae / D`.
7. `Fe` is looked up from the engagement table. If the selected `apRatio` and `aeRatio` are outside the allowed table area, the calculation stops.
8. The selected material row provides `Fm` and the base `Vc` range.
9. `Kv` is selected from `aeRatio` and material class: general or difficult.
10. Recommended `Vc`, and the displayed recommended `Vc` range, are calculated from the base speed range multiplied by `Kv`.
11. `Fd` is selected or linearly interpolated from cutter diameter.
12. Recommended `Fz` is calculated as `Fm * Fe * Fd` and rounded to 3 decimals.
13. Own `Vc` and own `Fz` are used only if the user entered values greater than 0.
14. Spindle speed `n` and table feed `Vf` are calculated from the used values.
15. Warning messages are shown after the result; warnings do not change the final numbers.

## 4. Cutting Speed

The app keeps the existing SmiCut `Vc` ranges as the base material data. It then applies an automatic cutting speed factor `Kv` from `ae / D`.

```text
base midpoint Vc = (Vc min + Vc max) / 2
recommended Vc = ceil(base midpoint Vc * Kv)
recommended Vc range = ceil(Vc min * Kv) to ceil(Vc max * Kv)
```

General materials use the general `Kv` column. This includes steel that is not hardened, cast iron, copper, aluminium, and graphite.

| ae/D | General Kv |
|---:|---:|
| 0.10 | 1.25 |
| 0.25 | 1.15 |
| 0.50 | 1.00 |
| 0.75 | 0.85 |
| 1.00 | 0.75 |

Difficult materials use the difficult-material `Kv` column. This includes hardened steel, stainless steel, titanium, nickel, and Inconel.

| ae/D | Difficult Kv |
|---:|---:|
| 0.10 | 1.15 |
| 0.25 | 1.05 |
| 0.50 | 0.90 |
| 0.75 | 0.75 |
| 1.00 | 0.65 |

If `ae / D` is between table rows, the app uses linear interpolation. If `ae / D` is below 0.10, the app uses the 0.10 Kv value. If `ae / D` is above 1.00, no calculation is shown.

## 5. Diameter Factor `Fd`

The app uses this table for diameter factor:

| Cutter diameter D mm | Fd |
|---:|---:|
| 0.5 | 0.004 |
| 1.0 | 0.006 |
| 2.0 | 0.009 |
| 3.0 | 0.012 |
| 4.0 | 0.016 |
| 5.0 | 0.022 |
| 6.0 | 0.032 |
| 8.0 | 0.045 |
| 10.0 | 0.056 |
| 12.0 | 0.074 |
| 14.0 | 0.086 |
| 16.0 | 0.098 |
| 18.0 | 0.110 |
| 20.0 | 0.122 |
| 25.0 | 0.135 |
| 32.0 | 0.145 |
| 40.0 | 0.155 |

If the entered diameter is between table rows, the app uses linear interpolation.

If the entered diameter is at or below the first row, the app uses the first row. If the entered diameter is at or above the last row, the app uses the last row. The UI validation currently limits the input to 0.5-40.0 mm.

## 6. Engagement Factor `Fe`

The app calculates:

```text
ap ratio = ap / D
ae ratio = ae / D
```

Then it uses this engagement factor table.

| ap/D | ae/D 0.05 | ae/D 0.10 | ae/D 0.15 | ae/D 0.20 | ae/D 0.25 | ae/D 0.35 | ae/D 0.50 | ae/D 0.75 | ae/D 1.00 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.25 | 2.4 | 2.4 | 2.2 | 2.0 | 1.8 | 1.6 | 1.4 | 1.2 | 1.0 |
| 0.50 | 2.2 | 2.2 | 2.0 | 1.7 | 1.5 | 1.4 | 1.2 | 0.9 | 0.7 |
| 0.75 | 2.0 | 2.0 | 1.8 | 1.5 | 1.3 | 1.2 | 1.0 | 0.7 | 0.6 |
| 1.00 | 1.65 | 1.65 | 1.6 | 1.3 | 1.1 | 1.0 | 0.8 | 0.6 | 0.5 |
| 1.25 | 1.6 | 1.6 | 1.4 | 1.1 | 0.9 | 0.8 | 0.6 | - | - |
| 1.50 | 1.4 | 1.4 | 1.2 | 0.9 | 0.7 | - | - | - | - |
| 2.00 | 1.2 | 1.2 | 1.0 | 0.7 | 0.5 | - | - | - | - |
| 2.50 | 1.0 | 1.0 | - | - | - | - | - | - | - |
| 3.00 | 0.8 | 0.8 | - | - | - | - | - | - | - |
| 3.50 | 0.65 | 0.65 | - | - | - | - | - | - | - |
| 4.00 | 0.52 | 0.52 | - | - | - | - | - | - | - |
| 4.50 | 0.41 | 0.41 | - | - | - | - | - | - | - |
| 5.00 | 0.33 | 0.33 | - | - | - | - | - | - | - |
| 5.50 | 0.27 | 0.27 | - | - | - | - | - | - | - |
| 6.00 | 0.22 | 0.22 | - | - | - | - | - | - | - |

The 0.05D column is intentionally kept at the same value as 0.10D. It gives the app a defined internal lookup point for very light radial engagement without increasing feed beyond the recommended 0.10D cap.

### Engagement Lookup Logic

1. If `ap / D <= 0`, `ae / D <= 0`, `ap / D > 6.0`, or `ae / D > 1.0`, no calculation is shown.
2. `ap / D` is clamped to the table range 0.25-6.00 for lookup.
3. `ae / D` is clamped to the table range 0.05-1.00 for lookup.
4. The app checks the maximum allowed `ae / D` for the selected `ap / D`.
5. If the entered `ae / D` is above the maximum valid table area, no calculation is shown.
6. If the exact table point exists, the app uses that value.
7. If the value is between valid table points, the app uses bilinear interpolation.
8. If bilinear interpolation is impossible because one of the surrounding cells is blank, the app uses the nearest valid table point inside the allowed area.

The maximum valid `ae / D` is interpolated from the last non-blank cell in each `ap / D` row. This is what stops deep cuts where the selected `ae / D` is outside the recommended catalogue area.

## 7. Final Calculation Formulas

### Cutting Speed

```text
recommended Vc = ceil(((Vc min + Vc max) / 2) * Kv)
recommended Vc range = ceil(Vc min * Kv) to ceil(Vc max * Kv)
used Vc = own Vc if entered and greater than 0, otherwise recommended Vc
```

### Feed Per Flute

```text
recommended Fz = Fm * Fe * Fd
```

The recommended feed per flute is rounded to 3 decimals before display and before it becomes the fallback calculation value:

```text
recommended Fz displayed = round(recommended Fz, 3)
used Fz = own Fz if entered and greater than 0, otherwise rounded recommended Fz
```

### Spindle Speed

```text
n = used Vc * 1000 / (pi * D)
```

### Table Feed

```text
Vf = used Fz * z * n
```

## 8. Warning Logic

| Condition | App behavior |
|---|---|
| `ap / D > 3.0` and `ae / D <= 0.10` | Calculation is allowed and a deep side milling warning is shown |
| `ap / D > 3.0` and `ae / D > 0.10` | Calculation is stopped because `Fe` is outside the valid engagement table area |
| Difficult material and `ae / D >= 0.95` | Calculation is allowed and a slotting warning is shown |

Difficult materials for end mills are hardened steel, stainless steel, titanium, nickel, and Inconel.

## 9. Rounding and Display Rules

| Value | Rule |
|---|---|
| Recommended cutting speed | `ceil(base midpoint Vc * Kv)` |
| Recommended cutting speed range | `ceil(Vc min * Kv)` to `ceil(Vc max * Kv)` |
| Used cutting speed | Own value if greater than 0, otherwise recommended |
| Material factor `Fm` | 1 decimal, hidden in UI but used |
| Diameter factor `Fd` | 3 decimals, hidden in UI but used |
| Engagement factor `Fe` | 3 decimals, hidden in UI but used |
| Cutting speed factor `Kv` | Used internally, not shown as a separate row |
| Feed per flute `Fz` | 3 decimals |
| Spindle speed | Nearest whole rpm |
| Table feed | Nearest whole mm/min |
| Decimal separator in UI | Comma |

## 10. Worked Example From the App

Inputs:

```text
Material: Steel, Low carbon, C < 0.25%
D = 10 mm
z = 4
ap = 10 mm
ae = 2.5 mm
```

Intermediate values:

```text
ap / D = 10 / 10 = 1.00
ae / D = 2.5 / 10 = 0.25
Fm = 1.2
Fd = 0.056
Fe = 1.1
Kv = 1.15
recommended Vc = ceil(((150 + 200) / 2) * 1.15) = 202 m/min
recommended Vc range = 173-230 m/min
```

Feed per flute:

```text
Fz = 1.2 * 1.1 * 0.056 = 0.07392
Displayed Fz = 0.074 mm/flute
```

Spindle speed:

```text
n = 202 * 1000 / (pi * 10) = 6430 rpm
```

Table feed:

```text
Vf = 0.074 * 4 * 6430 = 1903 mm/min
```

## 11. Things Worth Checking Manually

1. End Mills uses the shared `materialData` table for `Fm`, and `endmillSpeedData` for base `Vc`.
2. Aluminium uses the general `Kv` column, not a separate aluminium input or cutter type.
3. The app uses the rounded feed per flute as the default value for table feed.
4. Engagement factor interpolation is bilinear when all four surrounding cells exist.
5. Near blank engagement table cells, the app may fall back to the nearest valid table value inside the allowed area.
6. Deep side milling above 3.0xD is warning-only when `ae / D <= 0.10`; it is stopped when `ae / D > 0.10`.

## Material removal rate (2026-10-06, English review)

Adds Material removal rate (Q), using existing ap, ae and the unrounded actual
Vf: `Q = ap * ae * Vf / 1000` cm3/min. No new input. Uses actual speed/feed
including overrides; no result for invalid/unsupported cutting conditions.
Display has at most one decimal; tiny positive values show `< 0.1 cm³/min`.
Included in copied output. See [Operation Time Estimates](Operation%20Time%20Estimates.md).
