import assert from 'node:assert/strict';
import {createApparelCatalog} from '../lib/catalog/apparel-catalog.js';
import {calculateScreenprintPricing} from '../lib/pricing/screenprint.js';
const catalog=createApparelCatalog([
  ['TEE','M',3],['TEE','L',3],['TEE','2XL',5],['HOODIE','L',15],
].map(([style,size,casePrice])=>({vendor:'SanMar',style,title:style,color:'Black',size,normalizedSize:size,casePrice})));
const input={sameDesign:true,setupFeeEnabled:false,
 lineItems:[{style:'TEE',color:'Black',sizes:{M:10,L:10,'2XL':5}},{style:'HOODIE',color:'Black',sizes:{L:5}}],
 locations:['Front','Back','Right Sleeve','Left Sleeve'].map(name=>({name,colors:1}))};
const result=calculateScreenprintPricing(input,catalog);
assert.equal(result.pricedLines.length,3);
assert.deepEqual(result.pricedLines.map(l=>l.originalLineIndex),[0,0,1]);
assert.deepEqual(result.pricedLines[0].sizes,{M:10,L:10});
assert.deepEqual(result.pricedLines.map(l=>l.quantity),[20,5,5]);
for(const [i,cost] of [3,5,15].entries())assert.ok(Math.abs(result.pricedLines[i].unitPrice-(cost*1.15+12.5))<1e-9);
function reconciles(r){assert.equal(Math.round(r.pricedLines.reduce((s,l)=>s+l.lineTotal,0)*100),Math.round(r.retail*100));}
reconciles(result);
for(const sameDesign of [true,false])for(const setupFeeEnabled of [true,false])for(const percentage of [100,93,112]){
 const adjusted={...catalog,pricing:{channelAdjustments:[{channel:'hq_website',scope:'category',adjustment_key:'apparel',percentage}]}};
 const r=calculateScreenprintPricing({...input,sameDesign,setupFeeEnabled},adjusted);
 reconciles(r);
 const sharedSetup=setupFeeEnabled?25/(sameDesign?30:25):0;
 assert.ok(Math.abs(r.pricedLines[0].unitPrice-(3*1.15+12.5+sharedSetup)*percentage/100)<1e-9);
 assert.equal(r.pricedLines.reduce((s,l)=>s+l.quantity,0),30);
}
console.log('Screen-print individual prices passed: mixed styles, sizes, shared quantity, setup, adjustments, and cent reconciliation.');
