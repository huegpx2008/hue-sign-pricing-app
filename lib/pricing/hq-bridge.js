import { supplierMultiplier } from "./pricing-layers.js";
import { createApparelCatalog } from '../catalog/apparel-catalog.js';
export const bridgeEnabled = () => process.env.HQ_PRICING_BRIDGE_ENABLED === 'true';
async function bridge(path, body) {
  const secret = process.env.HQ_PRICING_BRIDGE_SECRET;
  const base = process.env.HQ_PRICING_BRIDGE_URL || 'https://hq.huegraphics.cc';
  const url = new URL(path, base);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new Error('Pricing bridge requires HTTPS.');
  if (!secret) throw new Error('Pricing bridge credentials are missing.');
  const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json' }, ...(body ? {body:JSON.stringify(body)} : {}), cache:'no-store', signal:AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('HQ current pricing is unavailable; no static prices were substituted.');
  return response.json();
}
export async function loadPublishedPricing() {
  if (!bridgeEnabled()) return null;
  const data = await bridge('/api/pricing/config');
  if (data.schemaVersion !== 3 || !data.release?.configuration || !data.release.id) throw new Error('Unsupported HQ pricing release.');
  data.release.configuration.releaseId = data.release.id;
  return data.release;
}
export async function loadRegularCosts(selections) {
  if (!bridgeEnabled()) return null;
  if (!selections.length) return {rows:[]};
  return bridge('/api/pricing/regular-costs', {selections});
}
export async function preparePricingCatalog(catalog, body) {
  const release = await loadPublishedPricing();
  if (!release) return catalog;
  const lines = Array.isArray(body.lineItems) ? body.lineItems : body.apparel?.style ? [body.apparel] : [];
  const selections = [...new Map(lines.filter(line=>line.style && line.color).map(line=>[line.style+'|'+line.color,{style:String(line.style),color:String(line.color)}])).values()];
  if (selections.length > 20) throw new Error('A quote supports at most 20 garment selections.');
  const costs = await loadRegularCosts(selections);
  const normalize = value => String(value).trim().toLowerCase();
  const key = row => [row.style,row.color,row.size].map(normalize).join('|');
  const byVariant = new Map(costs.rows.map(row=>[key(row),row.regularCost * supplierMultiplier(release.configuration,row.category)]));
  const selected = new Set(selections.map(row=>[row.style,row.color].map(normalize).join('|')));
  const rows = catalog.rows.filter(row=>selected.has([row.style,row.color].map(normalize).join('|'))).map(row=> {
    const cost = byVariant.get(key(row));
    return {...row, CASE_PRICE: cost ?? '', casePriceRaw: cost === undefined ? '' : String(cost), casePrice: cost ?? 0, unitCost: cost ?? 0};
  });
  for (const line of lines) for (const [size,quantity] of Object.entries(line.sizes || {})) {
    if (Number(quantity)>0 && !byVariant.has(key({...line,size}))) throw new Error('No current SanMar regular cost for '+line.style+' / '+line.color+' / '+size+'.');
  }
  const result = createApparelCatalog(rows);
  result.pricing = release.configuration;
  result.pricingSource = {releaseId:release.id, priceVersionId:costs.priceVersionId,checkedAt:costs.checkedAt};
  return result;
}
