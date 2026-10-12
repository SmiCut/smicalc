#!/usr/bin/env node
// Browser regression checks for generated Grooving apps. Run after regeneration.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const requested=process.argv[2]?.split(',')??['se'];
const screenshotDir=process.argv[3];
if(screenshotDir)fs.mkdirSync(screenshotDir,{recursive:true});
const files=[];
for(const dir of fs.readdirSync(path.join(root,'Translation'),{withFileTypes:true})) {
 if(!dir.isDirectory())continue;
 for(const name of fs.readdirSync(path.join(root,'Translation',dir.name))) {
  const match=name.match(/^smicut cutting data app-(.+)\.html$/);
  if(match&&(requested.includes('all')||requested.includes(match[1]))) files.push({suffix:match[1],file:path.join(root,'Translation',dir.name,name)});
 }
}
assert(files.length,'No matching apps');
const browser=await chromium.launch();
try {
 for(const {suffix,file} of files) {
  const errors=[];
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.__copied=value;}}}));
  await page.goto(pathToFileURL(file).href);
  await page.locator('.scd-tab[data-scd-section="grooving"]').click();
  await page.locator('#scd-groove-depth').waitFor({state:'visible'});
  const fill=(key,value)=>page.locator('#scd-groove-'+key).fill(value);
  const result=key=>page.locator('#scd-groove-result-'+key);
  const note=page.locator('#scd-groove-error-message');
  const speed=page.locator('#scd-groove-speed-recommended');
  const custom=page.locator('#scd-groove-custom-speed');
  assert.equal(await page.locator('#scd-groove-depth').inputValue(),'1,5');
  assert.equal(await speed.innerText(),'123 m/min');
  await fill('width','0.9');await fill('depth','2');
  const noRecommendation=await speed.innerText();
  assert(!/\d/.test(noRecommendation)&&noRecommendation.trim());
  const checkUnavailable=async()=>{
   for(const key of ['speed','feed','spindle','feed-rate','grade'])assert((await result(key).innerText()).includes(noRecommendation),`${suffix}: ${key}`);
   assert(await custom.isDisabled());
   await page.locator('#scd-groove-copy').click();
   const copied=await page.evaluate(()=>window.__copied);
   assert(copied.includes(noRecommendation));
   assert(copied.includes(await note.innerText()));
   assert(!/\b(?:HC|LC|rpm)\b/.test(copied));
  };
  await checkUnavailable();assert((await note.innerText()).includes('1,8'));
  await fill('depth','1.8');assert(!(await custom.isDisabled()));
  await fill('width','2');await fill('depth','1.85');await fill('diameter','87');
  await checkUnavailable();assert((await note.innerText()).includes('86'));
  if(screenshotDir) {
   await page.setViewportSize({width:390,height:844});
   await page.locator('#smicut-cutting-data-app').screenshot({path:path.join(screenshotDir,`${suffix}-mobile-warning.png`)});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
   await page.setViewportSize({width:1280,height:900});
  }
  await fill('diameter','86');assert(!(await custom.isDisabled()));
  await fill('depth','1.2');await fill('diameter','10000');assert.equal(await note.innerText(),'');
  await fill('diameter','20');await fill('depth','1.5');
  await fill('custom-speed','1000');assert((await note.innerText()).length>0);assert(!(await custom.isDisabled()));
  await fill('custom-speed','');await fill('custom-feed','0.1');assert((await note.innerText()).length>0);
  await fill('custom-feed','');
  await page.locator('#scd-groove-material').selectOption('7');await checkUnavailable();
  await page.locator('#scd-groove-material').selectOption('6');assert(!(await custom.isDisabled()));
  await fill('depth','2.1');assert.equal(await speed.innerText(),noRecommendation);assert(await page.locator('#scd-groove-copy').isDisabled());
  await fill('depth','1.5');await fill('width','3.6');assert(await page.locator('#scd-groove-copy').isDisabled());
  await fill('width','2');await fill('diameter','0');assert(await page.locator('#scd-groove-copy').isDisabled());
  await fill('diameter','20');await page.locator('#scd-groove-material').selectOption('0');
  await page.locator('#scd-groove-copy').click();assert((await page.evaluate(()=>window.__copied)).includes('123 m/min'));
  await page.locator('.scd-tab[data-scd-section="threadturning"]').click();
  await page.locator('#scd-turn-material').selectOption('7');
  for(const insert of ['triangular','fourcut']) {
   await page.locator(`input[name="scd-turn-insert-type"][value="${insert}"]`).check();
   assert(await page.locator('#scd-turn-custom-speed').isDisabled());
   assert((await page.locator('#scd-turn-copy-text').inputValue()).includes(noRecommendation));
  }
  await page.locator('#scd-turn-material').selectOption('0');assert(!(await page.locator('#scd-turn-custom-speed').isDisabled()));
  await page.setViewportSize({width:390,height:844});
  await page.locator('.scd-tab[data-scd-section="grooving"]').click();
  assert(await page.locator('#scd-groove-depth').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));
  assert.deepEqual(errors,[],`${suffix}: browser errors`);
  await page.close();console.log(`OK: ${suffix} defaults, geometry limits, HRC65, restoration, overrides, clipboard, mobile`);
 }
} finally {await browser.close();}
