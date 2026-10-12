# SmiCalc

Multilingual cutting-data calculators by [SmiCut](https://smicut.com), available
under the MIT license. Run the app locally, embed it in WordPress, or adapt it
under your own brand. No application build step is required.

## Calculators

- Thread tapping
- Thread turning
- FourCut SQ external radial grooving
- Solid carbide end mills
- Solid carbide drills
- Optional AI-assisted material selection

Thread-milling software is maintained separately in [SmiProg](https://github.com/SmiCut/smiprog).

## Quick start

Download the repository and open `smicut cutting data app.html` in your browser.
Calculator functions run locally. Internet access is needed for external links
and the separately hosted Material Selector. Choose materials manually to work offline.

The `Translation/` folders contain English and 19 localized editions. Each app
HTML file includes its own CSS, JavaScript, data and MIT license notice.
The separate material-category HTML files are also included.

For WordPress, use the widget HTML in a suitable Custom HTML block. Its CSS is
scoped under `#smicut-cutting-data-app`; see `wordpress-embed-design-guide.md`.
Test your theme and the way your site permits inline JavaScript.

## Reuse and your own brand

You may change the interface, logo, links and calculations, and distribute a
commercial version under your own brand. No visible SmiCut attribution is required.
Keep the MIT license and copyright notice with your distribution. See
[REBRANDING.md](REBRANDING.md) and [LICENSE](LICENSE).

The open-source license covers this repository, not access to SmiCut's hosted AI
service. Third-party deployments must arrange permitted backend access or provide
their own compatible service. The service URL and request contract are documented
in `docs/development.md`.

## Development and verification

Use Node.js 20 or later and Python 3.10 or later:

```bash
npm ci --ignore-scripts
npx playwright install chromium
python3 -m pip install -r requirements.txt
python3 Translation/tools/verify_localized_apps.py --locales all
npm test
```

Read [docs/development.md](docs/development.md) for source files, localization and
desktop/mobile screenshot checks. Read the relevant `* Data and Formulas.md`
before changing a calculation. Cutting data are starting recommendations and
must be adapted to the actual tool, material, setup and machine.

Issues and focused pull requests are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
