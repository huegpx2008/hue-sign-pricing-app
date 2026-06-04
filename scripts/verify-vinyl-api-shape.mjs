import { POST } from "../app/api/pricing/vinyl/route.js";
import { calculateGeneralSignPricing } from "../lib/pricing/general-signs.js";

const tolerance = 1e-9;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNoInternalFields(value, trail = "response") {
  const blocked = new Set([
    "cost",
    "profit",
    "margin",
    "marginPercent",
    "materialCost",
    "shipping",
    "supplierCost",
    "supplierRate",
    "basePrice",
    "shopPrice",
    "costMarginPrice",
    "actualTotalSqFt",
    "actualSqFtEach",
    "effectiveSqFtEach",
    "billableSqFtEach",
    "billingMode",
    "layoutWidth",
    "layoutHeight",
    "rawBillableSqFt",
    "piecesAcross",
    "rows",
    "pieceW",
    "pieceH",
    "rotated",
    "normalSqFt",
    "rotatedSqFt",
    "rollWidth",
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
  const request = new Request("http://localhost/api/pricing/vinyl", {
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
  width: 14,
  height: 10,
  quantity: 35,
  material: "premium-vehicle",
  laminate: "matte",
  contourCut: true,
  rush: true,
  gangLayout: true,
};

const expected = calculateGeneralSignPricing({
  product: "vinyl",
  activeProduct: "vinyl",
  width: requestBody.width,
  height: requestBody.height,
  qty: requestBody.quantity,
  margin: 60,
  multiplier: 1,
  useDesignFee: false,
  useSetupFee: false,
  designFee: "",
  setupFee: "",
  delivery: "",
  productMap: {},
  vinylType: "3m-controltac",
  vinylLaminate: "Matte Laminate",
  vinylContour: true,
  vinylRush: true,
  gangVinyl: true,
  contourPadding: 0.5,
  gangWastePercent: 15,
});

const success = await postJson(requestBody);
assert(success.status === 200, `Expected success status 200, got ${success.status}`);
assert(success.json.ok === true, "Expected ok=true");
assert(success.json.product === "vinyl", "Expected product=vinyl");
assert(success.json.currency === "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match pricing engine");
assert(Array.isArray(success.json.warnings), "Expected warnings array");
assert(success.json.warnings.length === 1, "Expected laminate compatibility warning");
assert(success.json.summary.material === "premium-vehicle", "Expected normalized material");
assert(success.json.summary.laminate === "matte", "Expected normalized laminate");
assert(success.json.summary.options.contourCut === true, "Expected contourCut option in summary");
assert(success.json.summary.options.rush === true, "Expected rush option in summary");
assert(success.json.summary.options.gangLayout === true, "Expected gangLayout option in summary");
assertNoInternalFields(success.json);

const reflective = await postJson({
  width: 24,
  height: 18,
  quantity: 6,
  type: "reflective",
  laminate: "gloss",
  contourCut: true,
  optimizeLayout: true,
});
const reflectiveExpected = calculateGeneralSignPricing({
  product: "reflective",
  activeProduct: "reflective",
  width: 24,
  height: 18,
  qty: 6,
  margin: 60,
  multiplier: 1,
  useDesignFee: false,
  useSetupFee: false,
  designFee: "",
  setupFee: "",
  delivery: "",
  productMap: {},
  vinylType: "gf-standard",
  vinylLaminate: "Gloss Laminate",
  vinylContour: true,
  vinylRush: false,
  gangVinyl: true,
  contourPadding: 0.5,
  gangWastePercent: 15,
});
assert(reflective.status === 200, `Expected reflective status 200, got ${reflective.status}`);
assert(Math.abs(reflective.json.price.retail - reflectiveExpected.retail) <= tolerance, "Reflective retail does not match pricing engine");
assert(reflective.json.summary.material === "reflective", "Expected reflective material");
assertNoInternalFields(reflective.json);

const invalid = await postJson({ width: 24, height: 18, quantity: 1, material: "cast-vinyl" });
assert(invalid.status === 400, `Expected validation status 400, got ${invalid.status}`);
assert(invalid.json.ok === false, "Expected validation ok=false");
assert(invalid.json.error?.code === "VALIDATION_ERROR", "Expected validation error code");
assert(invalid.json.error?.fields?.material === "Must be standard, reflective, low-tack-wall, or premium-vehicle", "Expected material validation message");

const missing = await postJson({ width: 24, height: 18, material: "standard" });
assert(missing.status === 400, `Expected missing-field status 400, got ${missing.status}`);
assert(missing.json.error?.fields?.quantity === "Required", "Expected quantity required message");

console.log("Vinyl pricing API response shape passed.");
