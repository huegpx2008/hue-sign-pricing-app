import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateGeneralSignPricing} from '../lib/pricing/general-signs.js';
import {structuredPricingDefaults} from '../lib/pricing/hq-sign-formulas.js';
const keys=['banner','yard-sign','acm','vinyl','custom-cut-coroplast','vehicle-magnet','mesh-banner','poster','acrylic','foamcore','pvc','polystyrene','aluminum','business-card','handheld-paper','carbonless','door-hanger'];
const configuration={signs:{products:Object.fromEntries(keys.map(key=>[key,{structuredPricing:structuredPricingDefaults(key)}]))}};
const fixture=JSON.parse(fs.readFileSync(new URL('../tests/fixtures/general-sign-pricing-parity.json',import.meta.url)));
let failures=0;
for(const test of fixture.cases){
 const actual=calculateGeneralSignPricing(test.input,configuration);
 for(const field of ['retail','each','cost','materialCost','shipping']) {
  if(Math.abs(actual[field]-test.expected[field])>0.011) {console.error(test.id,field,'expected',test.expected[field],'actual',actual[field]);failures++;}
 }
}
assert.equal(failures,0,'Published defaults must preserve existing pricing');
console.log('Published sign defaults match existing fixture prices.');
