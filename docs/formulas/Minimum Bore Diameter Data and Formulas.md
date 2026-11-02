# Minimum Bore Diameter - data and formulas

Standalone English prototype: `prototypes/minimum-bore/index.html`.
Open directly in a browser. No build, backend, external fonts or images required.
Production SmiCalc and localization sources are not modified.

## Sources and scope

- User-supplied `THREAD_TURNING-triangular.xlsx`, sheet `Blad1`: internal
  Triangular inserts (part numbers 06/08/11/16/22/27 IR or IL) and ten Micro inserts.
- https://smicut-1f2e8.kxcdn.com/wp-content/uploads/2024/01/Minimum-Bore-Diameter-in-Thread-Turning-Tools.pdf
  supplies 19 Triangular holder families, each applicable to right and left hand.
- User-supplied `SmiCut_ENG_2026-04_PRICES (dragen).pdf`, catalogue page 70:
  Micro geometry, thread-length limits and formula.
- U-Type, images, carbide-shank variants and holders absent from the chart
  are outside this version's scope. No equivalence to unlisted holders is assumed.

The workbook is read without modifications. Refresh its embedded insert data with
`python3 prototypes/minimum-bore/import_catalogue.py /absolute/path/to/workbook.xlsx`
(requires openpyxl). Holder constants are transcribed in that script.

## Triangular

Select hand, holder and insert, or switch to manual X without selecting an insert.
The insert list is filtered by holder insert size and hand. Search matches part
number or the workbook's thread-profile heading. The selected insert supplies X.
Out-of-range catalogue inserts remain discoverable but cannot produce a result.

All published pairs follow `minimum bore = C - X`. Between published X values,
the app uses linear interpolation, equivalent to this expression. Values outside
the published interval are rejected, including manually entered values.

| Holder suffix (SIR / SIL) | Insert size | X interval mm | C mm |
|---|---:|---:|---:|
| 0005_H06 | 6 | 0.5–0.9 | 6.5 |
| 0007_K08 | 8 | 0.6–1.0 | 8.2 |
| 0010_H11 | 11 | 0.6–1.0 | 12.4 |
| 0010_K11 | 11 | 0.6–1.0 | 12.4 |
| 0013_L11 | 11 | 0.6–1.0 | 15.5 |
| 0013_M16 | 16 | 0.6–1.8 | 16.8 |
| 0016_P16 | 16 | 0.6–1.8 | 19.8 |
| 0020_P16 | 16 | 0.6–1.8 | 23.7 |
| 0025_R16 | 16 | 0.6–1.8 | 28.7 |
| 0032_S16 | 16 | 0.6–1.8 | 35.7 |
| 0040_T16 | 16 | 0.6–1.8 | 43.7 |
| 0020_P22 | 22 | 1.5–3.3 | 25.6 |
| 0025_R22 | 22 | 1.5–3.3 | 30.6 |
| 0032_S22 | 22 | 1.5–3.3 | 37.6 |
| 0040_T22 | 22 | 1.5–3.3 | 45.6 |
| 0032_S27 | 27 | 1.6–3.8 | 38.6 |
| 0040_T27 | 27 | 1.6–3.8 | 46.6 |
| 0050_U27 | 27 | 1.6–3.8 | 56.6 |
| 0060_V27 | 27 | 1.6–3.8 | 66.6 |

Example: SIR_0020_P16 and 16IR_1.25ISO_FC, X = 0.8 mm, produce 22.90 mm.

## Micro

Select a Micro insert (D and usable length l from the workbook), then enter
thread length. `minimum bore = D + thread length × 0.035`, as printed on page 70.
Length must be greater than zero and no greater than that insert's l dimension.
Micro uses D, not X. No separate holder changes this calculation in the prototype.

Example: WR440_P60_BC, D = 4 mm and length = 10 mm, produce 4.35 mm.

## Validation, rounding and copying

Decimal point and comma are accepted. Blank, negative, zero (where prohibited),
non-finite or malformed inputs do not produce results. Invalid changes clear the
previous result and disable copying. Switching back to catalogue mode restores
the catalogue X, so manual edits cannot alter source data.

Display rounds **up** to 0.01 mm, avoiding a displayed minimum below the calculated
value. This conservative display rule is explicit in the UI and copied report;
it may differ from the catalogue's nearest-hundredth rounding for Micro.
Copy includes tool, inputs, result and method. When clipboard access is unavailable,
the app exposes a selected, read-only text area for manual copying.

## Integration

All CSS is scoped under `#smicut-cutting-data-app`; JavaScript is enclosed in an
IIFE and uses `bore-` identifiers. For future SmiCalc integration, move controls,
styles and logic into its existing root (do not nest a second root with the same ID),
then synchronize the two English production sources and handle localization.
