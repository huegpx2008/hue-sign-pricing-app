import assert from 'node:assert/strict';
import {calculateGeneralSignPricing} from '../lib/pricing/general-signs.js';
import {structuredPricingDefaults} from '../lib/pricing/hq-sign-formulas.js';
import {POST} from '../app/api/pricing/vinyl/route.js';
const configuration={releaseId:'vinyl-test',signs:{products:{vinyl:{structuredPricing:structuredPricingDefaults('vinyl')}}},channelAdjustments:[]};
for(const product of ['reflective','footprints']) {
 for(const gangVinyl of [false,true])for(const vinylContour of [false,true])for(const vinylRush of [false,true]) {
  const input={product,activeProduct:product,productMap:{},width:12,height:18,qty:10,vinylType:'gf-standard',margin:60,multiplier:1,gangVinyl,vinylContour,vinylRush,contourPadding:0.5,gangWastePercent:15};
  const old=calculateGeneralSignPricing(input);const current=calculateGeneralSignPricing(input,configuration);
  assert.ok(Math.abs(old.retail-current.retail)<0.001,product+' defaults changed');
  const changed=structuredClone(configuration);changed.signs.products.vinyl.structuredPricing.materials.find(row=>row.key===product).costPerSqFt*=2;
  assert.ok(calculateGeneralSignPricing(input,changed).retail>current.retail,product+' ignores HQ material rate');
 }
}
const previousRelease=structuredClone(configuration);
previousRelease.signs.products.vinyl.structuredPricing.materials=previousRelease.signs.products.vinyl.structuredPricing.materials.filter(row=>row.key!=='footprints');
assert.equal(calculateGeneralSignPricing({product:'footprints',activeProduct:'footprints',width:12,height:12,qty:10,vinylType:'gf-standard',margin:60,multiplier:1},previousRelease).retail,72.5);
process.env.HQ_PRICING_BRIDGE_ENABLED='true';process.env.HQ_PRICING_BRIDGE_SECRET='test-only';
globalThis.fetch=async()=>Response.json({schemaVersion:3,release:{id:'vinyl-test',configuration}});
for(const material of ['reflective','footprints']) {
 const response=await POST(new Request('https://example.test/api/pricing/vinyl',{method:'POST',body:JSON.stringify({width:12,height:12,quantity:10,material})}));
 const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));assert.equal(data.pricingReleaseId,'vinyl-test');
 assert.equal(data.price.retail,material==='reflective'?210:72.5);
}
console.log('PASS: reflective/footprints legacy parity, published material changes, finishing/layout/rush options, and HQ vinyl API.');
