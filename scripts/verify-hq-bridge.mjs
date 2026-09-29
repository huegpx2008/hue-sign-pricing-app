import assert from 'node:assert/strict';
import {POST as dtf} from '../app/api/pricing/dtf/route.js';
import {POST as screen} from '../app/api/pricing/screenprint/route.js';
import {POST as browser} from '../app/api/pricing/browser-estimate/route.js';
import {screenprintPricingConstants as matrix} from '../lib/pricing/screenprint.js';
const config={apparel:{dtf:{marginPercent:60,materialPerLinearInch:0.5,minimumMaterialCharge:10,shipping:10,sleeveRetailEach:1,customerGarmentFee:20,rollWidth:22,padding:0.25},embroidery:{garmentMarginPercent:60,decorationMarginPercent:60}},screenprint:{minimumQuantity:24,maxColors:4,productMarkupMultiplier:1.15,setupFee:25,tiers:matrix.QTY_TIERS.map(minimumQuantity=>({minimumQuantity,firstSide:Object.values(matrix.SINGLE_SIDE[minimumQuantity]),additionalSide:Object.values(matrix.ADD_SIDE[minimumQuantity])}))},supplierAdjustments:[],channelAdjustments:[]};
process.env.HQ_PRICING_BRIDGE_ENABLED='true';process.env.HQ_PRICING_BRIDGE_SECRET='test-only';
let unavailable=false;
globalThis.fetch=async(url,options)=>{
 assert.equal(options.headers.Authorization,'Bearer test-only');
 if(unavailable)return Response.json({error:'Unavailable'},{status:503});
 if(String(url).endsWith('/config'))return Response.json({schemaVersion:3,release:{id:'release-test',configuration:structuredClone(config)}});
 const selections=JSON.parse(options.body).selections;
 return Response.json({priceVersionId:'price-test',checkedAt:new Date().toISOString(),rows:selections.flatMap(row=>['S','M','L','XL','2XL'].map(size=>({...row,size,regularCost:size==='2XL'?4.10:2.21,category:'T-Shirts'})))});
};
const post=async(handler,body)=>{const response=await handler(new Request('https://quotes.huegraphics.cc/api/pricing/test',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}}));return {status:response.status,data:await response.json()};};
const sizes={S:5,M:10,L:15,XL:15,'2XL':5};
const body={mode:'standard',apparel:{source:'catalog',style:'3000',color:'Black',sizes},printLocations:[{placement:'front',preset:'fullFront',enabled:true}],layout:{optimize:true},artwork:{supplied:true,status:'printReady'}};
let response=await post(dtf,body);assert.equal(response.status,200,JSON.stringify(response.data));assert.ok(Math.abs(response.data.price.retail-950.5)<0.001);assert.equal(response.data.pricingReleaseId,'release-test');
const browserInput={dtfMode:'standard',apparel:{style:'3000',color:'Black',sizes},frontPreset:'Full Front',backPreset:'None',optimizeLayout:true};
let client=await post(browser,{kind:'dtf',input:browserInput});assert.equal(client.status,200);assert.equal(client.data.result.retail,response.data.price.retail);
const inspect=value=>{if(!value||typeof value!=='object')return;for(const [key,entry]of Object.entries(value)){assert.ok(!/cost|profit|margin|caseprice|supplier/i.test(key),'Private field leaked: '+key);inspect(entry);}};inspect(client.data.result);
config.channelAdjustments=[{channel:'hq_website',scope:'category',adjustment_key:'apparel',percentage:110}];response=await post(dtf,body);assert.ok(Math.abs(response.data.price.retail-1045.55)<0.001);
const tiers=response.data.summary.sizePriceBreakdown;assert.ok(Math.abs(tiers.reduce((sum,tier)=>sum+tier.quantity*tier.priceEach,0)-response.data.price.retail)<0.02);
config.channelAdjustments=[];config.screenprint.productMarkupMultiplier=1.25;
response=await post(screen,{lineItems:[{style:'3000',color:'Black',sizes}],locations:[{name:'Front',colors:1}],sameDesign:true,setupFeeEnabled:true});assert.equal(response.status,200,JSON.stringify(response.data));assert.ok(Math.abs(response.data.price.retail-(119.95*1.25+50*5.85+25))<0.001);
unavailable=true;const previousError=console.error;console.error=()=>{};try{response=await post(dtf,body);assert.notEqual(response.status,200);client=await post(browser,{kind:'dtf',input:browserInput});assert.equal(client.status,503);}finally{console.error=previousError;}
console.log('PASS: live regular cost replaces static cost, browser/API parity, editable markup, channel adjustment, size totals, private-field exclusion, and no stale fallback.');
