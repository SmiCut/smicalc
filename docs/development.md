# Development

The English production source is `smicut cutting data app.html`. Keep it byte for
byte identical to `Translation/English/smicut cutting data app-eng.html`:

```bash
cmp "smicut cutting data app.html" "Translation/English/smicut cutting data app-eng.html"
```

Update the matching formula document when calculation logic changes. Keep all CSS
scoped under `#smicut-cutting-data-app`. Preserve IDs, units, grade codes, material
keys and thread standards unless the intended feature explicitly changes them.

## Localization

The source workbook is `outputs/translation-basis-20260603/smicut-cutting-data-translation-basis.xlsx`.
The approved URL map is `outputs/smicut_language_url_map_smicalc.xlsx`. These paths
are retained to keep the generator compatible; the folder contains only the two
selected source workbooks. Canonical material keys are in
`Translation/material-category-keys.json`.

Update the workbook or generator, then regenerate the affected language. For example:

```bash
python3 Translation/tools/generate_localized_html.py sv --app-only
python3 Translation/tools/verify_localized_apps.py --locales sv
node Translation/tools/capture_localized_app_screenshots.mjs --locales se --outDir Translation/qa-screenshots/current
```

The locale configuration in the generator lists all 19 locales, workbook columns,
filename suffixes and API language codes. Swedish uses API code `sv` and file
suffix `se`. Do not invent localized SmiCut URLs or translate material keys.
Omit `--app-only` when intentionally updating the static material-category catalogue.
Review visible changes at desktop and mobile widths, including validation,
overrides, warnings and copy buttons. `NODE_BINARY` can override the verifier's
Node executable; by default it uses `node` from PATH.

## Material Selector

The frontend calls `https://smicut-material-selector-production.up.railway.app/api/chat`.
The server code is maintained separately. Its runtime access is not granted by
MIT. Preserve the existing request contract: see the fetch body in the HTML.
Locale-specific language codes and stable material keys connect replies to the
frontend's translated labels. Do not send credentials in browser code.
Calculator tests run without calling this backend.

For SmiCut-hosted access, follow [the website approval guide](../MATERIAL_SELECTOR.md).
Website approval requires no browser API key. Preserve `message`, `language`,
`history` and the material-key response fields. To use your own compatible service,
change the `API_URL` constant in the English HTML, synchronize both English sources
and regenerate localized apps; never embed an AI-provider secret in HTML.
