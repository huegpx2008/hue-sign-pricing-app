import { POST } from "../app/api/pricing/yard-sign/route.js";
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
    "tierPrice",
    "costMarginPrice",
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
  const request = new Request("http://localhost/api/pricing/yard-sign", {
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
  quantity: 50,
  sides: "double",
  stakeType: "standard",
};

const expected = calculateGeneralSignPricing({
  product: "coro",
  activeProduct: "coro",
  width: 24,
  height: 18,
  qty: requestBody.quantity,
  margin: 60,
  multiplier: 1,
  useDesignFee: false,
  useSetupFee: false,
  designFee: "",
  setupFee: "",
  delivery: "",
  productMap: {},
  coroDouble: true,
  coroFlute: "vertical",
  stakes: true,
  heavyStakes: false,
  grommets: false,
  gloss: false,
  coroContour: false,
  coroRush: false,
});

const success = await postJson(requestBody);
assert(success.status === 200, `Expected success status 200, got ${success.status}`);
assert(success.json.ok === true, "Expected ok=true");
assert(success.json.product === "yard-sign", "Expected product=yard-sign");
assert(success.json.currency === "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match pricing engine");
assert(Array.isArray(success.json.warnings), "Expected warnings array");
assert(success.json.summary.size === "18 x 24", "Expected 18 x 24 summary size");
assert(success.json.summary.sides === requestBody.sides, "Expected summary sides");
assert(success.json.summary.stakeType === requestBody.stakeType, "Expected summary stakeType");
assertNoInternalFields(success.json);

const invalid = await postJson({ quantity: 50, sides: "triple", stakeType: "standard" });
assert(invalid.status === 400, `Expected validation status 400, got ${invalid.status}`);
assert(invalid.json.ok === false, "Expected validation ok=false");
assert(invalid.json.error?.code === "VALIDATION_ERROR", "Expected validation error code");
assert(invalid.json.error?.fields?.sides === "Must be single or double", "Expected sides validation message");

const missing = await postJson({ quantity: 50, sides: "single" });
assert(missing.status === 400, `Expected missing-field status 400, got ${missing.status}`);
assert(missing.json.error?.fields?.stakeType === "Required", "Expected stakeType required message");

console.log("Yard sign pricing API response shape passed.");
