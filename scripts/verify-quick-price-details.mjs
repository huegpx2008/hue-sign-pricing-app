import assert from 'node:assert/strict';
import { POST as vinyl } from '../app/api/pricing/vinyl/route.js';
import { POST as pvc } from '../app/api/pricing/pvc/route.js';
import { structuredPricingDefaults } from '../lib/pricing/hq-sign-formulas.js';
import { layoutDtfTransfers } from '../lib/pricing/dtf.js';
process.env.HQ_PRICING_BRIDGE_ENABLED='true';
process.env.HQ_PRICING_BRIDGE_SECRET='fixture';
process.env.HUE_PRICING_INTERNAL_API_SECRET='fixture-private-key-with-at-least-32-characters';
const products=Object.fromEntries(['vinyl','pvc'].map(key=>[key,{structuredPricing:structuredPricingDefaults(key)}]));
globalThis.fetch=async()=>Response.json({schemaVersion:3,release:{id:'layout-test',configuration:{signs:{products},channelAdjustments:[]}}});
for(const [route,body] of [[vinyl,{width:12,height:18,quantity:10,material:'standard',gangLayout:true}],[pvc,{width:12,height:18,quantity:10,type:'3-single'}]]){
 const call=async(token)=>{const response=await route(new Request('https://fixture.test/api/pricing',{method:'POST',headers:token?{authorization:'Bearer '+token}:{},body:JSON.stringify(body)}));const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data};
 const publicData=await call();const wrong=await call('wrong');const privateData=await call(process.env.HUE_PRICING_INTERNAL_API_SECRET);
 assert.equal(publicData.internalCost,undefined);assert.equal(wrong.internalCost,undefined);
 assert.deepEqual(publicData.price,privateData.price);
 assert.ok(privateData.internalCost.cost>0);
 const d=privateData.internalCost.details;assert.ok((d.piecesAcross||d.sheetAcross)>0);assert.ok((d.pieceW||d.previewPieceW)>0);
 assert.equal(privateData.pricingReleaseId,'layout-test');
}
const layout=layoutDtfTransfers(Array.from({length:50},()=>({width:11,height:10})),22,.25,true);
assert.equal(layout.placements.length,50);
for(const p of layout.placements){assert.ok(p.x>=0 && p.y>=0);assert.ok(p.x+p.width<=layout.rollWidth);assert.ok(p.y+p.height<=layout.linearInches);}
console.log('PASS: private cost authorization, unchanged selling prices, published vinyl/PVC layout metadata, DTF placement bounds.');
