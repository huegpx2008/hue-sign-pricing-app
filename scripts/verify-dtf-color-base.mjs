import assert from "node:assert/strict";
import { loadApparelCatalog, createApparelCatalog, findStyle, calculateApparelLineCost, selectDtfBaseProduct } from "../lib/catalog/apparel-catalog.js";
import { calculateDtfPricing } from "../lib/pricing/dtf.js";
import { calculateScreenprintPricing } from "../lib/pricing/screenprint.js";
import { POST, setDtfCatalogLoaderForTests } from "../app/api/pricing/dtf/route.js";

const catalog = await loadApparelCatalog();
const sizes = { S: 5, M: 10, L: 15, XL: 15, "2XL": 5 };
const rows = findStyle("3000", catalog).rows;
const reordered = createApparelCatalog([...rows].reverse());
for (const source of [catalog, reordered]) {
  for (const color of ["Black", "Stone Blue"]) {
    const apparel = { style: "3000", color, sizes };
    assert.equal(calculateApparelLineCost(apparel, source, { mode: "dtf" }).garmentCost, 45 * 2.36 + 5 * 4.10);
    assert.equal(selectDtfBaseProduct(rows.filter(r => r.color === color)).size, "S");
    const result = calculateDtfPricing({ apparel, frontPreset: "Full Front", optimizeLayout: true }, source);
    assert.equal(Math.round(result.retail * 100) / 100, 967.38);
    assert.equal(calculateApparelLineCost({ ...apparel, apparelCost: 5 }, source, { mode: "dtf" }).apparelCostUsed, 5);
    const big = calculateApparelLineCost({ ...apparel, sizes: { "2XL": 5 } }, source, { mode: "dtf" });
    assert.equal(big.apparelCostUsed, 4.10);
    assert.equal(big.sizeUpchargeTotal, 0);
    assert(Math.abs(result.sizePriceBreakdown.reduce((sum, tier) => sum + tier.qty * tier.priceEach, 0) - result.retail) < 1e-8);
    assert(Math.abs(result.sizePriceBreakdown.find(t => t.label === "2XL").priceEach - result.sizePriceBreakdown.find(t => t.label === "S").priceEach - (4.10 - 2.36) / 0.4) < 1e-8);
    // Screen printing must retain exact size costs, independently of CSV ordering.
    const screen = calculateApparelLineCost(apparel, source, { mode: "screen" });
    assert.equal(screen.garmentCost, 45 * 2.36 + 5 * 4.10);
    const printInput = { lineItems: [apparel], locations: [{ name: "Front", colors: 1 }], sameDesign: true, setupFeeEnabled: true };
    const baseline = calculateScreenprintPricing({ ...printInput, lineItems: [{ ...apparel, color: "Black" }] }, catalog);
    assert.equal(calculateScreenprintPricing(printInput, source).retail, baseline.retail);
    setDtfCatalogLoaderForTests(async () => source);
    const response = await POST(new Request("http://localhost/api/pricing/dtf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "standard", apparel: { ...apparel, source: "catalog" }, printLocations: [{ placement: "front", preset: "fullFront", enabled: true }], layout: { optimize: true } }) }));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(Math.round(data.price.retail * 100) / 100, 967.38);
    assert.deepEqual(data.summary.locations[0].size, { width: 11, height: 10 });
  }
}
setDtfCatalogLoaderForTests();
console.log("DTF color/row-order regression passed; API/app totals match at $967.38 and screen-print size costs are unchanged.");

// Unequal standard sizes, extended/youth sizes and color premiums must all use exact costs.
const testRows = [
  ["S", 2], ["XL", 3], ["2XL", 7], ["5XL", 10], ["XS", 1.5], ["YXL", 4],
].map(([size, casePrice]) => ({ style: "TEST", title: "Test tee", color: "Black", size, casePrice }));
const synthetic = createApparelCatalog(testRows);
const testInput = { apparel: { style: "TEST", color: "Black", sizes: { S: 2, XL: 1, "2XL": 3, XS: 1, YXL: 2 } }, frontPreset: "Left Chest" };
const exact = calculateDtfPricing(testInput, synthetic);
assert.equal(exact.apparelDirectCost, 37.5);
assert.equal(exact.pricingErrors.length, 0);
assert.equal(exact.sizeUpchargeTotal, 0);
assert(Math.abs(exact.sizePriceBreakdown.find(t => t.label === "2XL").priceEach - exact.sizePriceBreakdown.find(t => t.label === "S").priceEach - 12.5) < 1e-8);
assert(Math.abs(exact.sizePriceBreakdown.reduce((sum,t) => sum+t.qty*t.priceEach,0) - exact.retail) < 1e-8);
const override = calculateDtfPricing({ ...testInput, apparel: { ...testInput.apparel, apparelCost: 6 } }, synthetic);
assert.equal(override.apparelDirectCost, 54);
assert.equal(new Set(override.sizePriceBreakdown.map(t => t.priceEach)).size, 1);
assert(calculateDtfPricing({ ...testInput, apparel: { ...testInput.apparel, sizes: { UNKNOWN: 1 } } }, synthetic).pricingErrors.length);
assert.equal(calculateDtfPricing({ ...testInput, dtfMode: "dtfOnly" }, synthetic).apparelDirectCost, 0);
assert.equal(calculateDtfPricing({ ...testInput, bringYourOwnApparel: true }, synthetic).apparelDirectCost, 0);
console.log("Exact size/color costs, tier totals, overrides, missing costs and decoration-only cases passed.");
