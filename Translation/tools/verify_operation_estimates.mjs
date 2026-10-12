#!/usr/bin/env node
// English production timing/MRR regression checks; no backend/network required.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = process.argv[2];
if(out) fs.mkdirSync(out, {recursive:true});
const browser = await chromium.launch();
let checks = 0;
try {
 const page = await browser.newPage({viewport:{width:1280,height:1000}});
 const errors = [];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied=text;}}}));
 await page.goto(pathToFileURL(path.join(root,'smicut cutting data app.html')).href);
 const tab = async name=>page.locator(`.scd-tab[data-scd-section="${name}"]`).click();
 const fill = async (id,value)=>page.locator('#'+id).fill(String(value));
 const radio = async (name,value)=>page.locator(`input[name="${name}"][value="${value}"]`).check();
 const material = async (id,key)=>page.locator('#'+id).selectOption(String(await page.evaluate(k=>window.smiCutCuttingDataApp.findMaterialIndexFromKey(k),key)));
 const container = kind=>page.locator(`#scd-${kind}-operation-results`);
 const val = async (kind,row=0)=>page.locator(`#scd-${kind}-operation-${row} .scd-result-value`).innerText();
 const num = text=>Number(text.replace(',','.').replace(/[^0-9.]/g,''));
 const close = (actual,expected,tolerance=.051)=>{assert(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);checks++;};
 const hidden = async kind=>{assert(await container(kind).evaluate(e=>e.hidden));assert.equal(await container(kind).textContent(),'');checks++;};
 const copy = async (kind,id)=>{await page.locator('#'+id).click();const text=await page.evaluate(()=>window.__copied);assert(text.includes(await val(kind)));checks++;return text;};
 const ordered = async kind=>{
  const cut=num(await val(kind));const [lo,hi]=(await val(kind,1)).replace(' sec','').split('–').map(num);
  assert(lo<=hi && hi>=cut);checks++;
 };
 // MRR is based on the unrounded actual feed: exact reference 20 cm³/min.
 await tab('endmills');
 await fill('scd-endmill-custom-speed',100*Math.PI); // D10 => 10,000 rpm
 await fill('scd-endmill-custom-feed-flute',.02);
 close(num(await val('endmill')),20);
 assert((await copy('endmill','scd-endmill-copy')).includes('Material removal rate (Q)'));
 await fill('scd-endmill-custom-feed-flute',.04);close(num(await val('endmill')),40);
 await fill('scd-endmill-ae',0);await hidden('endmill');
 await fill('scd-endmill-ae',2.5);
 // Grooving: H=1.5, n=1000, f=.03 => 3.0 sec.
 await tab('grooving');
 await fill('scd-groove-custom-speed',20*Math.PI);
 await fill('scd-groove-custom-feed',.03);
 close(num(await val('groove')),3);
 assert.equal(await container('groove').locator('summary').count(),0);
 assert(!(await copy('groove','scd-groove-copy')).includes('Time estimate assumptions'));checks++;
 await fill('scd-groove-width',.4);await hidden('groove');
 await fill('scd-groove-width',2);
 await material('scd-groove-material','steel-hardened-hrc65');await hidden('groove');
 await material('scd-groove-material','steel-low-carbon');
 // Thread turning: M10x1.5, 1000 rpm, 6 passes and 36 mm => 8.64 sec.
 await tab('threadturning');
 await hidden('turn');
 await page.locator('#scd-turn-thread-profile').selectOption('metricFine');
 await fill('scd-turn-thread-diameter',10);await fill('scd-turn-thread-pitch',1.5);
 await fill('scd-turn-custom-speed',10*Math.PI);await fill('scd-turn-custom-passes',6);
 await fill('scd-turn-operation-depth',36);
 close(num(await val('turn')),8.64);await ordered('turn');
 assert((await copy('turn','scd-turn-copy')).includes('Thread length: 36 mm'));
 await fill('scd-turn-custom-passes',12);close(num(await val('turn')),17.28);
 await fill('scd-turn-custom-passes','');
 const triangular=num(await val('turn'));await radio('scd-turn-insert-type','fourcut');
 assert(num(await val('turn'))<triangular);checks++;
 await material('scd-turn-material','steel-hardened-hrc65');await hidden('turn');
 await material('scd-turn-material','steel-low-carbon');
 await fill('scd-turn-operation-depth','');await hidden('turn');
 await fill('scd-turn-operation-depth',36);
 // Timo reference: M10x1.5, 600 rpm, programmed travel 20 mm => 2.6667 sec, down + up.
 await tab('tapping');await hidden('tap');
 await page.locator('#scd-tap-thread-profile').selectOption('metricFine');
 await fill('scd-tap-thread-diameter',10);await fill('scd-tap-thread-pitch',1.5);
 await fill('scd-tap-custom-speed',6*Math.PI);await fill('scd-tap-operation-depth',20);
 close(num(await val('tap')),2.6667);await ordered('tap');
 assert((await copy('tap','scd-tap-copy')).includes('downstroke and return'));
 await radio('scd-tap-type','tb');close(num(await val('tap')),2.6667);
 await fill('scd-tap-custom-speed',10*Math.PI);
 await material('scd-tap-material','steel-hardened-hrc65');await hidden('tap');
 await material('scd-tap-material','steel-low-carbon');
 // Drilling uses exactly the entered travel; through coolant removes peck comparison.
 await tab('drills');await hidden('drill');
 await fill('scd-custom-speed',10*Math.PI);await fill('scd-custom-feed-rev',.2);
 await fill('scd-drill-operation-depth','20,0');
 close(num(await val('drill')),6);
 assert.equal(await container('drill').locator('.scd-result-row').count(),3);checks++;
 await ordered('drill');const peckRange=await val('drill',2);assert(peckRange.includes('–'));
 const copied=await copy('drill','scd-copy');assert(copied.includes('Peck drilling')&&copied.includes('programmed travel')&&!copied.includes('140°'));
 await radio('scd-coolant','with');assert.equal(await container('drill').locator('.scd-result-row').count(),2);checks++;
 await page.locator('#scd-copy').click();assert(!(await page.evaluate(()=>window.__copied)).includes('Peck drilling'));checks++;
 await radio('scd-coolant','without');await fill('scd-drill-operation-depth','19.99');assert.equal(await container('drill').locator('.scd-result-row').count(),2);checks++;
 await fill('scd-drill-operation-depth',30);assert.equal(await page.locator('#scd-drill-operation-depth').getAttribute('aria-invalid'),'false');
 await fill('scd-drill-operation-depth','30.01');await hidden('drill');assert(await page.locator('#scd-copy').isDisabled());
 await radio('scd-drill-length','5xd');assert.equal(await page.locator('#scd-drill-operation-depth').getAttribute('aria-invalid'),'false');checks++;
 await material('scd-material','cast-iron-lamellar-hb150');assert.equal(await container('drill').locator('.scd-result-row').count(),2);checks++;
 await material('scd-material','steel-medium-carbon');assert.equal(await container('drill').locator('.scd-result-row').count(),3);checks++;
 await fill('scd-drill-operation-depth',30);assert.equal(await container('drill').locator('.scd-result-row').count(),2);checks++;
 await material('scd-material','steel-low-carbon');
 // Optional field validation, clear-and-restore, and no stale copy results in all three tabs.
 for(const [kind,section,copyId,valid] of [['drill','drills','scd-copy',25],['tap','tapping','scd-tap-copy',20],['turn','threadturning','scd-turn-copy',36]]) {
  await tab(section);
  for(const bad of ['0','-1','abc','20oops','Infinity','1e309']) {
   await fill(`scd-${kind}-operation-depth`,bad);await hidden(kind);
   assert.equal(await page.locator(`#scd-${kind}-operation-depth`).getAttribute('aria-invalid'),'true');
   assert(await page.locator('#'+copyId).isDisabled());checks++;
  }
  await fill(`scd-${kind}-operation-depth`,'');await hidden(kind);
  await page.locator('#'+copyId).click();assert(!(await page.evaluate(()=>window.__copied)).includes('Estimated cycle time'));checks++;
  await fill(`scd-${kind}-operation-depth`,valid);assert(!(await page.locator('#'+copyId).isDisabled()));checks++;
 }
 // Validate existing TFK and inch-thread paths, which share the new timing code.
 await tab('tapping');
 await page.locator('#scd-tap-thread-profile').selectOption('metricCoarse');
 await page.locator('#scd-tap-thread-size').selectOption({label:'M6'});
 await radio('scd-tap-type','tfk');
 assert((await container('tap').innerText()).includes('Tapping time'));checks++;
 await ordered('tap');
 await radio('scd-tap-type','tt');
 await page.locator('#scd-tap-thread-profile').selectOption('unConstant');
 await fill('scd-tap-thread-diameter',10);await fill('scd-tap-thread-pitch',20);
 await fill('scd-tap-operation-depth',20);
 close(num(await val('tap')),120*20/1270);
 await page.locator('#scd-tap-thread-profile').selectOption('metricFine');
 await fill('scd-tap-thread-pitch',1.5);
 // Invalid base inputs must clear new values as well as optional-field errors.
 for(const [kind,section,id,bad,restore] of [
  ['drill','drills','scd-diameter',0,10],
  ['tap','tapping','scd-tap-thread-diameter',0,10],
  ['turn','threadturning','scd-turn-thread-pitch',0,1.5],
  ['groove','grooving','scd-groove-depth',2.1,1.5],
  ['endmill','endmills','scd-endmill-diameter',0,10]
 ]) {
  await tab(section);await fill(id,bad);await hidden(kind);await fill(id,restore);
  assert((await container(kind).textContent()).length>0);checks++;
 }
 // 8xD coolant restriction and an actual 3xD hole in a long drill.
 await tab('drills');await radio('scd-coolant','with');await radio('scd-drill-length','8xd');
 await fill('scd-drill-operation-depth',80);assert.equal(await container('drill').locator('.scd-result-row').count(),2);checks++;
 await radio('scd-coolant','without');await hidden('drill');
 assert.equal(await page.locator('input[name="scd-drill-length"]:checked').inputValue(),'3xd');checks++;
 await radio('scd-drill-length','5xd');await fill('scd-drill-operation-depth',25);
 assert.equal(await val('drill',1),'8,7–10 sec');assert.equal(await val('drill',2),'9–16 sec');checks+=2;
 // Mobile and desktop layout, including expanded assumptions and long peck labels.
 for(const width of [1280,390]) {
  await page.setViewportSize({width,height:1000});
  for(const [kind,section] of [['drill','drills'],['tap','tapping'],['turn','threadturning'],['groove','grooving'],['endmill','endmills']]) {
   await tab(section);
   const disclosure=container(kind).locator('summary');
   if(await disclosure.count()) await disclosure.click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
   assert(!overflow,`${kind} overflows at ${width}`);checks++;
   if(out) await page.screenshot({path:path.join(out,`${kind}-${width}.png`),fullPage:true});
   if(await disclosure.count()) await disclosure.click();
  }
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${checks} operation-estimate checks; five calculators at desktop/mobile widths; no browser errors.`);
} finally { await browser.close(); }
