import { POST, setScreenprintCatalogLoaderForTests } from "../app/api/pricing/screenprint/route.js";
import { loadApparelCatalog } from "../lib/catalog/apparel-catalog.js";
import { calculateScreenprintPricing } from "../lib/pricing/screenprint.js";

const tolerance = 1e-9;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoInternalFields(value, trail = "response") {
  const blocked = new Set([
    "cost",
    "profit",
    "margin",
    "marginPercent",
    "materialCost",
    "supplierCost",
    "supplierRate",
    "garmentCost",
    "apparelDirectCost",
    "apparelRetailSubtotal",
    "printChargeSubtotal",
    "setupFee",
    "casePrice",
    "blankCasePrice",
    "markedUpGarmentPrice",
    "productMarkupPercent",
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
  const request = new Request("http://localhost/api/pricing/screenprint", {
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
      style: "2000",
      color: "Black",
      sizes: {
        S: 12,
        M: 12,
        L: 12,
        XL: 12,
      },
    },
  ],
  locations: [
    { name: "Front", colors: 1 },
    { name: "Back", colors: 1 },
  ],
  sameDesign: true,
  darkGarments: true,
  whiteUnderbase: true,
  setupFeeEnabled: true,
};

const catalog = await loadApparelCatalog({ forceReload: true });
const expected = calculateScreenprintPricing(requestBody, catalog);
const success = await postJson(requestBody);

assert(success.status === 200, `Expected success status 200, got ${success.status}`);
assert(success.json.ok === true, "Expected ok=true");
assert(success.json.product === "screenprint", "Expected product=screenprint");
assert(success.json.currency === "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match screen print pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match screen print pricing engine");
assert(success.json.summary.totalQuantity === expected.totalGarments, "Expected total quantity in summary");
assert(success.json.summary.lineItems[0].style === requestBody.lineItems[0].style, "Expected line item style in summary");
assert(success.json.summary.locations.length === 2, "Expected two print locations");
assert(success.json.warnings.some((warning) => warning.includes("underbase")), "Expected underbase warning");
assertNoInternalFields(success.json);

const infant = await postJson({
  ...requestBody,
  lineItems: [{ style: "RS4400", color: "White", sizes: { "06M": 24 } }],
  locations: [{ name: "Front", colors: 1 }],
  darkGarments: false,
  whiteUnderbase: false,
});
assert(infant.status === 200, `Expected screen print infant request status 200, got ${infant.status}`);
assert(infant.json.summary.totalQuantity === 24, "Expected screen print to count all infant garments");
assert(infant.json.summary.lineItems[0].sizes["06M"] === 24, "Expected exact supplier size key in screen print summary");

const unavailableInfantSize = await postJson({
  ...requestBody,
  lineItems: [{ style: "RS4400", color: "White", sizes: { "09M": 24 } }],
});
assert(unavailableInfantSize.status === 400, "Expected screen print to reject unavailable catalog size");
assert(
  unavailableInfantSize.json.error?.fields?.["lineItems.0.sizes.09M"] === "No catalog price for style, color, and size",
  "Expected screen print catalog-specific size validation",
);

const lowQuantity = await postJson({
  ...requestBody,
  lineItems: [{ style: "2000", color: "Black", sizes: { S: 6 } }],
  darkGarments: false,
  whiteUnderbase: false,
});
assert(lowQuantity.status === 200, `Expected low quantity status 200, got ${lowQuantity.status}`);
assert(lowQuantity.json.warnings.some((warning) => warning.includes("24 pieces")), "Expected low quantity warning");

const invalid = await postJson({
  lineItems: [{ style: "NOPE", color: "Black", sizes: { S: 12 } }],
  locations: [{ name: "Front", colors: 1 }],
});
assert(invalid.status === 400, `Expected validation status 400, got ${invalid.status}`);
assert(invalid.json.ok === false, "Expected validation ok=false");
assert(invalid.json.error?.code === "VALIDATION_ERROR", "Expected validation error code");
assert(invalid.json.error?.fields?.["lineItems.0.style"] === "Unknown style", "Expected unknown style validation message");

setScreenprintCatalogLoaderForTests(async () => {
  const error = new Error("Simulated missing private catalog");
  error.suppressLog = true;
  throw error;
});
const catalogFailure = await postJson(requestBody);
assert(catalogFailure.status === 500, `Expected catalog failure status 500, got ${catalogFailure.status}`);
assert(catalogFailure.json.ok === false, "Expected catalog failure ok=false");
assert(catalogFailure.json.error?.code === "INTERNAL_ERROR", "Expected internal error code");
assert(catalogFailure.json.error?.message === "Screen print pricing failed.", "Expected internal error message");
assert(catalogFailure.json.error?.details === "Simulated missing private catalog", "Expected safe error details");
setScreenprintCatalogLoaderForTests(null);

console.log("Screen print pricing API response shape passed.");
