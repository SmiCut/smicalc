"""Check the exact offline HTML delivered individually and inside the release ZIP."""
import codecs
import json
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

import build_downloads


class DownloadTest(unittest.TestCase):
    def test_offline_text_encoding(self):
        editions = json.loads((build_downloads.ROOT / "docs/downloads.json").read_text())
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            with patch.object(build_downloads, "OUT", output):
                build_downloads.main()
            with zipfile.ZipFile(output / "smicalc-apps.zip") as archive:
                for edition in editions:
                    name = edition["download"]
                    with self.subTest(name=name):
                        source = build_downloads.ROOT / edition["source"]
                        data = (output / name).read_bytes()
                        self.assertTrue(data.startswith(codecs.BOM_UTF8))
                        self.assertEqual(data.decode("utf-8-sig"), source.read_bytes().decode("utf-8-sig"))
                        self.assertEqual(archive.read(name), data)


if __name__ == "__main__":
    unittest.main()
