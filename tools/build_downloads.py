#!/usr/bin/env python3
"""Build user downloads from the checked-in production HTML, without changing it."""
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/downloads'
BASE = 'https://github.com/SmiCut/smicalc/releases/latest/download/'


def main():
    editions = json.loads((ROOT / 'docs/downloads.json').read_text())
    names = [e['download'] for e in editions]
    if len(names) != 20 or len(set(names)) != len(names):
        raise ValueError('Expected 20 uniquely named downloads')
    OUT.mkdir(parents=True, exist_ok=True)
    table = '| Language | Use online | Download HTML |\n|---|---|---|\n'
    guide = ('SMICALC — START HERE\n\n'
             '1. Extract this ZIP before opening a file.\n'
             '2. Find your language below.\n'
             '3. Double-click its HTML file to open it in a web browser.\n\n'
             'No installation or GitHub account is needed. Calculators work offline\n'
             'with manual material selection. Internet and an approved website are\n'
             'required for the hosted AI Material Selector; local files do not enable it.\n\n'
             'LANGUAGES AND FILES\n')
    assets = {}
    for edition in editions:
        name = edition['download']
        if Path(name).name != name or not name.endswith('.html'):
            raise ValueError(f'Invalid download filename: {name}')
        data = (ROOT / edition['source']).read_bytes()
        if b'MIT License' not in data or b'smicut-cutting-data-app' not in data:
            raise ValueError(f'Missing app or license: {name}')
        assets[name] = data
        (OUT / name).write_bytes(data)
        guide += f"{edition['language']}: {name}\n"
        table += f"| {edition['language']} | [Open SmiCalc]({edition['online']}) | [Download]({BASE}{name}) |\n"
    guide += ('\nUPDATES, HELP AND CUSTOMIZATION\n'
              'Downloads do not update automatically. Keep backups of your own changes.\n'
              'Latest downloads: https://github.com/SmiCut/smicalc#choose-your-language\n'
              'Help: https://github.com/SmiCut/smicalc/blob/main/docs/getting-started.md\n'
              'Own brand: https://github.com/SmiCut/smicalc/blob/main/REBRANDING.md\n'
              'AI website approval: https://github.com/SmiCut/smicalc/blob/main/MATERIAL_SELECTOR.md\n\n'
              'You may use and adapt SmiCalc commercially. Customization requires editing\n'
              'the code; a web developer can help. Keep the MIT license and copyright\n'
              'notice with distributed copies. The HTML files already contain it.\n\n'
              'Check cutting data for your tool, material, machine and setup before use.\n')
    with zipfile.ZipFile(OUT / 'smicalc-apps.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, data in {**assets, 'START-HERE.txt': guide.encode(),
                           'LICENSE': (ROOT / 'LICENSE').read_bytes()}.items():
            info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data)
    checksum_names = [*names, 'smicalc-apps.zip']
    (OUT / 'SMICALC-SHA256SUMS').write_text(''.join(
        f"{hashlib.sha256((OUT / name).read_bytes()).hexdigest()}  {name}\n"
        for name in checksum_names))
    notes = ('## Choose your language\n\n'
             'Download one HTML file below, then double-click it to open SmiCalc in your browser. '
             'No installation or GitHub account is needed.\n\n' + table + '\n'
             f'[Download all languages in one ZIP]({BASE}smicalc-apps.zip). '
             'Extract it first and follow START-HERE.txt. The individual HTML files are ready to use.\n\n'
             'Calculators work offline with manual material selection. The AI Material Selector '
             'needs internet and an approved website; it is not enabled by opening a local file.\n\n'
             '[Help opening the app](https://github.com/SmiCut/smicalc/blob/main/docs/getting-started.md) · '
             '[Adapt for your company](https://github.com/SmiCut/smicalc/blob/main/REBRANDING.md)\n\n'
             'The Source code archives below are for developers. To use SmiCalc, choose your language above. '
             'SMICALC-SHA256SUMS is an optional download-integrity file.\n')
    (OUT / 'RELEASE-NOTES.md').write_text(notes)
    print(f'Created {len(editions)} HTML downloads, all-language ZIP, checksums and release notes in {OUT}')


if __name__ == '__main__':
    main()
