#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  console.error("Playwright is required for screenshot QA.");
  console.error("Install it in this workspace before running screenshots, for example:");
  console.error("  npm install --no-save playwright");
  console.error(`Original import error: ${error.message}`);
  process.exit(2);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const translationDir = path.join(root, "Translation");

function parseArgs(argv) {
  const options = {
    locales: "all",
    outDir: path.join(root, "Translation/qa-screenshots"),
    sections: "start,materialselector,tapping,threadturning,grooving,endmills,drills",
    viewports: "desktop:1280x900,mobile:390x844",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }
    const [key, inlineValue] = arg.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) {
      index += 1;
    }
    if (key in options) {
      options[key] = value;
    } else {
      throw new Error(`Unknown option --${key}`);
    }
  }

  return options;
}

function findAppFiles(localesValue) {
  const wanted = localesValue === "all"
    ? null
    : new Set(localesValue.split(",").map((item) => item.trim()).filter(Boolean));
  const files = [];

  for (const entry of fs.readdirSync(translationDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const folder = path.join(translationDir, entry.name);
    for (const fileName of fs.readdirSync(folder)) {
      const match = fileName.match(/^smicut cutting data app-(.+)\.html$/);
      if (!match) {
        continue;
      }
      const suffix = match[1];
      if (wanted && !wanted.has(suffix)) {
        continue;
      }
      files.push({ suffix, path: path.join(folder, fileName) });
    }
  }

  if (wanted) {
    const found = new Set(files.map((file) => file.suffix));
    const missing = [...wanted].filter((locale) => !found.has(locale));
    if (missing.length) {
      throw new Error(`No app HTML file found for locale suffix(es): ${missing.join(", ")}`);
    }
  }

  return files.sort((a, b) => a.suffix.localeCompare(b.suffix));
}

function parseViewports(value) {
  return value.split(",").map((item) => {
    const match = item.match(/^([^:]+):(\d+)x(\d+)$/);
    if (!match) {
      throw new Error(`Invalid viewport '${item}'. Expected name:widthxheight`);
    }
    return {
      name: match[1],
      width: Number(match[2]),
      height: Number(match[3]),
    };
  });
}

async function activateSection(page, section) {
  if (section === "start") {
    await page.locator('.scd-tab[data-scd-section="start"]').click();
  } else {
    await page.locator(`.scd-tab[data-scd-section="${section}"]`).click();
  }
  await page.waitForTimeout(150);
}

async function collectLayoutWarnings(page, file, viewport, section) {
  const result = await page.evaluate((activeSectionName) => {
    const sectionIds = {
      start: "scd-start-section",
      materialselector: "scd-materialselector-section",
      tapping: "scd-tapping-section",
      threadturning: "scd-threadturning-section",
      grooving: "scd-grooving-section",
      endmills: "scd-endmills-section",
      drills: "scd-drills-section",
    };
    const rootElement = document.documentElement;
    const app = document.querySelector("#smicut-cutting-data-app");
    const activeSection = document.getElementById(sectionIds[activeSectionName] || "");
    const isHidden = activeSection ? activeSection.classList.contains("scd-panel-hidden") : true;
    return {
      rootScrollWidth: rootElement.scrollWidth,
      rootClientWidth: rootElement.clientWidth,
      appScrollWidth: app ? app.scrollWidth : 0,
      appClientWidth: app ? app.clientWidth : 0,
      activeSectionExists: Boolean(activeSection) && !isHidden,
      activeSectionHeight: activeSection ? activeSection.getBoundingClientRect().height : 0,
    };
  }, section);

  const warnings = [];
  if (!result.activeSectionExists || result.activeSectionHeight <= 0) {
    warnings.push(`${file.suffix}/${viewport.name}/${section}: active section is missing or collapsed`);
  }
  if (result.rootScrollWidth > result.rootClientWidth + 1) {
    warnings.push(
      `${file.suffix}/${viewport.name}/${section}: page has horizontal overflow ${result.rootScrollWidth}px > ${result.rootClientWidth}px`,
    );
  }
  if (result.appScrollWidth > result.appClientWidth + 1) {
    warnings.push(
      `${file.suffix}/${viewport.name}/${section}: app has horizontal overflow ${result.appScrollWidth}px > ${result.appClientWidth}px`,
    );
  }
  return warnings;
}

const options = parseArgs(process.argv.slice(2));
const files = findAppFiles(options.locales);
const sections = options.sections.split(",").map((section) => section.trim()).filter(Boolean);
const viewports = parseViewports(options.viewports);

fs.mkdirSync(options.outDir, { recursive: true });

const browser = await chromium.launch();
const warnings = [];
let screenshotCount = 0;

try {
  for (const file of files) {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });
      await page.goto(pathToFileURL(file.path).href, { waitUntil: "load" });

      for (const section of sections) {
        await activateSection(page, section);
        warnings.push(...await collectLayoutWarnings(page, file, viewport, section));
        const screenshotPath = path.join(options.outDir, `${file.suffix}-${viewport.name}-${section}.png`);
        await page.locator("#smicut-cutting-data-app").screenshot({ path: screenshotPath });
        screenshotCount += 1;
      }

      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (warnings.length) {
  for (const warning of warnings) {
    console.error(`WARN: ${warning}`);
  }
  console.error(`Captured ${screenshotCount} screenshots in ${options.outDir}`);
  process.exit(1);
}

console.log(`OK: captured ${screenshotCount} screenshots in ${options.outDir}`);
