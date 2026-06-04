import { POST } from "../app/api/pricing/acm/route.js";
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
    "sheetsUsed",
    "sheetsRounded",
    "piecesPerSheet",
    "sheetLayout",
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
  const request = new Request("http://localhost/api/pricing/acm", {
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
  width: 32,
  height: 48,
  quantity: 4,
  thickness: "6mm",
  sides: "double",
  contourCut: true,
  glossLaminate: true,
  rush: true,
};

const expected = calculateGeneralSignPricing({
  product: "acm",
  activeProduct: "acm",
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
  acmType: "6-double",
  acmContour: true,
  roundedCorners: false,
});

const success = await postJson(requestBody);
assert(success.status === 200, `Expected success status 200, got ${success.status}`);
assert(success.json.ok === true, "Expected ok=true");
assert(success.json.product === "acm", "Expected product=acm");
assert(success.json.currency === "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match pricing engine");
assert(Array.isArray(success.json.warnings), "Expected warnings array");
assert(success.json.warnings.length === 2, "Expected gloss/rush compatibility warnings");
assert(success.json.summary.thickness === requestBody.thickness.toLowerCase(), "Expected normalized thickness");
assert(success.json.summary.sides === requestBody.sides, "Expected summary sides");
assert(success.json.summary.options.contourCut === true, "Expected contourCut option in summary");
assert(success.json.summary.options.glossLaminate === true, "Expected glossLaminate option in summary");
assert(success.json.summary.options.rush === true, "Expected rush option in summary");
assertNoInternalFields(success.json);

const invalid = await postJson({ width: 24, height: 18, quantity: 1, thickness: "9mm", sides: "single" });
assert(invalid.status === 400, `Expected validation status 400, got ${invalid.status}`);
assert(invalid.json.ok === false, "Expected validation ok=false");
assert(invalid.json.error?.code === "VALIDATION_ERROR", "Expected validation error code");
assert(invalid.json.error?.fields?.thickness === "Must be 3mm or 6mm", "Expected thickness validation message");

const missing = await postJson({ width: 24, height: 18, thickness: "3mm", sides: "single" });
assert(missing.status === 400, `Expected missing-field status 400, got ${missing.status}`);
assert(missing.json.error?.fields?.quantity === "Required", "Expected quantity required message");

console.log("ACM pricing API response shape passed.");
