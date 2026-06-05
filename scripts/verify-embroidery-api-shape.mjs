import assert from "node:assert/strict";
import { POST, setEmbroideryCatalogLoaderForTests } from "../app/api/pricing/embroidery/route.js";

function assertNoInternalFields(value, trail = "response") {
  const blocked = new Set([
    "cost",
    "profit",
    "margin",
    "marginPercent",
    "supplierCost",
    "supplierRate",
    "garmentCost",
    "apparelDirectCost",
    "apparelRetailSubtotal",
    "embroideryEachDirect",
    "embroideryDirectTotal",
    "embroideryRetailEach",
    "embroideryRetailSubtotal",
    "embroiderySubtotal",
    "threadExtraEach",
    "namesEach",
    "numbersEach",
    "puffEach",
    "handlingDirect",
    "casePrice",
    "blankCasePrice",
    "digitizingFees",
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
  const request = new Request("http://localhost/api/pricing/embroidery", {
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

const requestBody = {
  lineItems: [
    {
      style: "K540",
      color: "Black",
      sizes: {
        S: 6,
        M: 12,
        L: 12,
        XL: 6,
        "2XL": 2,
      },
    },
  ],
  locations: [
    {
      placement: "Left Chest",
      stitchCount: 8000,
      threadColors: 3,
      puff3mm: false,
    },
    {
      placement: "Sleeve",
      stitchCount: 5000,
      threadColors: 2,
      puff3mm: false,
    },
  ],
  digitizingRequired: true,
  names: {
    enabled: false,
    large: false,
  },
  numbers: {
    enabled: false,
    large: false,
  },
};

const success = await postJson(requestBody);
assert.equal(success.status, 200, `Expected success status 200, got ${success.status}`);
assert.equal(success.json.ok, true, "Expected ok=true");
assert.equal(success.json.product, "embroidery", "Expected product=embroidery");
assert.equal(success.json.currency, "USD", "Expected currency=USD");
assert.equal(typeof success.json.price?.retail, "number", "Expected numeric retail price");
assert.equal(typeof success.json.price?.each, "number", "Expected numeric each price");
assert.equal(success.json.summary?.label, "Embroidery", "Expected summary label");
assert.equal(success.json.summary?.totalQuantity, 38, "Expected total quantity");
assert.equal(success.json.summary?.lineItems?.[0]?.style, "K540", "Expected line item style");
assert.equal(success.json.summary?.location?.placement, "Left Chest", "Expected first location to be used");
assert.equal(success.json.summary?.location?.stitchCount, 8000, "Expected stitch count in summary");
assert.equal(success.json.summary?.options?.digitizingRequired, true, "Expected digitizing flag");
assert(success.json.warnings.some((warning) => warning.includes("Multiple embroidery locations")), "Expected multi-location warning");
assertNoInternalFields(success.json);

const invalidStyle = await postJson({
  ...requestBody,
  lineItems: [{ style: "NOPE", color: "Black", sizes: { S: 12 } }],
  locations: [requestBody.locations[0]],
});
assert.equal(invalidStyle.status, 400, `Expected validation status 400, got ${invalidStyle.status}`);
assert.equal(invalidStyle.json.ok, false, "Expected validation ok=false");
assert.equal(invalidStyle.json.error?.code, "VALIDATION_ERROR", "Expected validation error code");
assert.equal(invalidStyle.json.error?.fields?.["lineItems.0.style"], "Unknown style", "Expected unknown style validation message");

const invalidStitches = await postJson({
  ...requestBody,
  locations: [{ ...requestBody.locations[0], stitchCount: 0 }],
});
assert.equal(invalidStitches.status, 400, `Expected stitch validation status 400, got ${invalidStitches.status}`);
assert.equal(invalidStitches.json.error?.fields?.["locations.0.stitchCount"], "Must be a positive number", "Expected stitch validation message");

setEmbroideryCatalogLoaderForTests(async () => {
  const error = new Error("Simulated missing private catalog");
  error.suppressLog = true;
  throw error;
});
const catalogFailure = await postJson({
  ...requestBody,
  locations: [requestBody.locations[0]],
});
assert.equal(catalogFailure.status, 500, `Expected catalog failure status 500, got ${catalogFailure.status}`);
assert.equal(catalogFailure.json.ok, false, "Expected catalog failure ok=false");
assert.equal(catalogFailure.json.error?.code, "INTERNAL_ERROR", "Expected internal error code");
assert.equal(catalogFailure.json.error?.message, "Embroidery pricing failed.", "Expected internal error message");
assert.equal(catalogFailure.json.error?.details, "Simulated missing private catalog", "Expected safe error details");
setEmbroideryCatalogLoaderForTests(null);

console.log("Embroidery pricing API response shape passed.");
