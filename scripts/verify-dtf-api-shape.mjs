import assert from "node:assert/strict";
import { POST, setDtfCatalogLoaderForTests } from "../app/api/pricing/dtf/route.js";
import { findStyle, loadApparelCatalog } from "../lib/catalog/apparel-catalog.js";
import { calculateDtfPricing } from "../lib/pricing/dtf.js";

const tolerance = 1e-9;

function assertNoInternalFields(value, trail = "response") {
  const blocked = new Set([
    "CASE_PRICE",
    "casePrice",
    "casePriceRaw",
    "blankCasePrice",
    "supplierCost",
    "supplierRate",
    "materialCost",
    "dtfMaterialCost",
    "dtfRetailSubtotal",
    "directCost",
    "cost",
    "profit",
    "margin",
    "markup",
    "markedUpGarmentPrice",
    "apparelDirectCost",
    "apparelRetailSubtotal",
    "apparelCostUsed",
    "sizeUpchargeTotal",
    "sleeveRetailAddOnTotal",
    "byoaRetailFee",
    "internalBreakdown",
  ]);

  if (!value || typeof value !== "object") return;

  for (const [key, nested] of Object.entries(value)) {
    const path = `${trail}.${key}`;
    assert(!blocked.has(key), `Internal field leaked: ${path}`);
    assertNoInternalFields(nested, path);
  }
}

async function postJson(body) {
  const request = new Request("http://localhost/api/pricing/dtf", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const response = await POST(request);
  return {
    status: response.status,
    json: await response.json(),
  };
}

async function postRaw(body) {
  const request = new Request("http://localhost/api/pricing/dtf", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const response = await POST(request);
  return {
    status: response.status,
    json: await response.json(),
  };
}

function engineInputForStandard(catalog, body) {
  const style = findStyle(body.apparel.style, catalog);
  return {
    dtfMode: "standard",
    apparel: {
      style: body.apparel.style,
      styleKey: style.key,
      color: body.apparel.color,
      sizes: body.apparel.sizes,
    },
    frontPreset: "Full Front",
    backPreset: "Full Back",
    optimizeLayout: true,
  };
}

const requestBody = {
  mode: "standard",
  apparel: {
    source: "catalog",
    style: "BC3001",
    color: "Black",
    sizes: {
      S: 12,
      M: 12,
      L: 12,
      XL: 12,
    },
  },
  printLocations: [
    { placement: "front", preset: "fullFront", enabled: true },
    { placement: "back", preset: "fullBack", enabled: true },
  ],
  layout: {
    optimize: true,
  },
  artwork: {
    supplied: true,
    status: "printReady",
  },
  production: {
    rush: false,
  },
};

const catalog = await loadApparelCatalog({ forceReload: true });
const expected = calculateDtfPricing(engineInputForStandard(catalog, requestBody), catalog);
const success = await postJson(requestBody);

assert.equal(success.status, 200, `Expected success status 200, got ${success.status}`);
assert.equal(success.json.ok, true, "Expected ok=true");
assert.equal(success.json.product, "dtf", "Expected product=dtf");
assert.equal(success.json.currency, "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match DTF pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match DTF pricing engine");
assert.equal(success.json.summary.label, "DTF Transfers", "Expected summary label");
assert.equal(success.json.summary.mode, "standard", "Expected standard mode summary");
assert.equal(success.json.summary.totalQuantity, 48, "Expected total quantity");
assert.equal(success.json.summary.apparel.style, "BC3001", "Expected style in summary");
assert.equal(success.json.summary.apparel.color, "Black", "Expected color in summary");
assert.equal(success.json.summary.locations.length, 2, "Expected two locations");
assert.equal(success.json.summary.layout.rollWidth, 22, "Expected 22 inch roll width");
assert.equal(success.json.summary.options.artworkSupplied, true, "Expected artwork flag");
assert.deepEqual(success.json.warnings, [], "Expected no warnings for clean request");
assertNoInternalFields(success.json);

const infantRequest = {
  mode: "standard",
  apparel: {
    source: "catalog",
    supplier: "SanMar",
    supplierStyle: "",
    style: "RS4400",
    color: "White",
    sizes: {
      "06M": 24,
    },
  },
  printLocations: [
    { placement: "front", preset: "fullFront", enabled: true },
  ],
  layout: { optimize: true },
  artwork: { supplied: true, status: "printReady" },
  production: { rush: false },
};
const infant = await postJson(infantRequest);
assert.equal(infant.status, 200, `Expected RS4400 infant request status 200, got ${infant.status}`);
assert.equal(infant.json.summary.totalQuantity, 24, "Expected all 24 infant garments to be priced");
assert.deepEqual(infant.json.summary.apparel.sizes, { "06M": 24 }, "Expected exact supplier size key in summary");
assert.equal(infant.json.price.retail, 500.5, "Expected RS4400 pricing to use the existing DTF formula");
assert.equal(infant.json.price.each, 20.854166666666668, "Expected RS4400 per-piece price");
assertNoInternalFields(infant.json);

const unavailableInfantSize = await postJson({
  ...infantRequest,
  apparel: { ...infantRequest.apparel, sizes: { "09M": 24 } },
});
assert.equal(unavailableInfantSize.status, 400, "Expected unavailable catalog size to be rejected");
assert.equal(
  unavailableInfantSize.json.error?.fields?.["apparel.sizes.09M"],
  "No catalog price for style, color, and size",
  "Expected catalog-specific size validation",
);

const standardSizeBaseline = await postJson({
  ...requestBody,
  apparel: {
    ...requestBody.apparel,
    sizes: { S: 4, M: 4, L: 4, XL: 4, "2XL": 4, "3XL": 4 },
  },
  printLocations: [{ placement: "front", preset: "fullFront", enabled: true }],
});
assert.equal(standardSizeBaseline.status, 200, "Expected S-3XL baseline request status 200");
assert.equal(standardSizeBaseline.json.price.retail, 629.5, "S-3XL retail must remain unchanged");
assert.equal(standardSizeBaseline.json.price.each, 26.229166666666668, "S-3XL each price must remain unchanged");
assert.deepEqual(
  standardSizeBaseline.json.summary.apparel.sizes,
  { S: 4, M: 4, L: 4, XL: 4, "2XL": 4, "3XL": 4 },
  "Expected standard supplier size keys to remain unchanged",
);

const dtfOnly = await postJson({
  mode: "dtfOnly",
  transfer: {
    width: 11,
    height: 10,
    quantity: 25,
  },
  layout: { optimize: true },
  artwork: { supplied: true, status: "printReady" },
  production: { rush: false },
});
assert.equal(dtfOnly.status, 200, `Expected DTF-only status 200, got ${dtfOnly.status}`);
assert.equal(dtfOnly.json.summary.mode, "dtfOnly", "Expected DTF-only mode");
assert.equal(dtfOnly.json.summary.transfer.quantity, 25, "Expected DTF-only quantity");
assertNoInternalFields(dtfOnly.json);

const byo = await postJson({
  mode: "standard",
  apparel: {
    source: "customerProvided",
    quantity: 30,
  },
  printLocations: [
    { placement: "front", preset: "fullFront", enabled: true },
    { placement: "leftSleeve", enabled: true },
  ],
  artwork: { supplied: false, status: "notSupplied" },
  production: { rush: true },
});
assert.equal(byo.status, 200, `Expected BYO status 200, got ${byo.status}`);
assert.equal(byo.json.summary.apparel.source, "customerProvided", "Expected BYO apparel summary");
assert(byo.json.warnings.some((warning) => warning.includes("Artwork")), "Expected artwork warning");
assert(byo.json.warnings.some((warning) => warning.includes("Rush")), "Expected rush warning");
assertNoInternalFields(byo.json);

const tooWide = await postJson({
  mode: "dtfOnly",
  transfer: {
    width: 24,
    height: 8,
    quantity: 10,
  },
  artwork: { supplied: true, status: "printReady" },
});
assert.equal(tooWide.status, 200, `Expected too-wide status 200, got ${tooWide.status}`);
assert(tooWide.json.warnings.some((warning) => warning.includes("roll width")), "Expected roll-width warning");
assertNoInternalFields(tooWide.json);

const invalidStyle = await postJson({
  ...requestBody,
  apparel: { ...requestBody.apparel, style: "NOPE" },
});
assert.equal(invalidStyle.status, 400, `Expected invalid style status 400, got ${invalidStyle.status}`);
assert.equal(invalidStyle.json.ok, false, "Expected validation ok=false");
assert.equal(invalidStyle.json.error?.code, "VALIDATION_ERROR", "Expected validation error code");
assert.equal(invalidStyle.json.error?.fields?.["apparel.style"], "Unknown style", "Expected unknown style validation message");

const invalidTransfer = await postJson({
  mode: "dtfOnly",
  transfer: { width: 0, height: 8, quantity: 10 },
});
assert.equal(invalidTransfer.status, 400, `Expected invalid transfer status 400, got ${invalidTransfer.status}`);
assert.equal(invalidTransfer.json.error?.fields?.["transfer.width"], "Must be a positive number", "Expected transfer width validation");

const missingLocation = await postJson({
  mode: "standard",
  apparel: requestBody.apparel,
  printLocations: [],
});
assert.equal(missingLocation.status, 400, `Expected missing location status 400, got ${missingLocation.status}`);
assert.equal(missingLocation.json.error?.fields?.printLocations, "At least one enabled print location is required", "Expected missing location validation");

const invalidJson = await postRaw("{ nope");
assert.equal(invalidJson.status, 400, `Expected invalid JSON status 400, got ${invalidJson.status}`);
assert.equal(invalidJson.json.error?.code, "INVALID_JSON", "Expected invalid JSON code");

setDtfCatalogLoaderForTests(async () => {
  const error = new Error("Simulated missing private catalog");
  error.suppressLog = true;
  throw error;
});
const catalogFailure = await postJson(requestBody);
assert.equal(catalogFailure.status, 500, `Expected catalog failure status 500, got ${catalogFailure.status}`);
assert.equal(catalogFailure.json.ok, false, "Expected catalog failure ok=false");
assert.equal(catalogFailure.json.error?.code, "INTERNAL_ERROR", "Expected internal error code");
assert.equal(catalogFailure.json.error?.message, "DTF pricing failed.", "Expected internal error message");
assert.equal(catalogFailure.json.error?.details, "Simulated missing private catalog", "Expected safe error details");
setDtfCatalogLoaderForTests(null);

console.log("DTF pricing API response shape passed.");
