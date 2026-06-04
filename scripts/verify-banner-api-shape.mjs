import { POST } from "../app/api/pricing/banner/route.js";
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
  const request = new Request("http://localhost/api/pricing/banner", {
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
  width: 72,
  height: 36,
  quantity: 2,
  material: "18-double",
  polePocket: true,
  rope: true,
  windSlits: true,
  rush: true,
};

const expected = calculateGeneralSignPricing({
  product: "banner",
  activeProduct: "banner",
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
  bannerType: requestBody.material,
  polePocket: requestBody.polePocket,
  rope: requestBody.rope,
  windSlits: requestBody.windSlits,
  bannerRush: requestBody.rush,
});

const success = await postJson(requestBody);
assert(success.status === 200, `Expected success status 200, got ${success.status}`);
assert(success.json.ok === true, "Expected ok=true");
assert(success.json.product === "banner", "Expected product=banner");
assert(success.json.currency === "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match pricing engine");
assert(Array.isArray(success.json.warnings), "Expected warnings array");
assert(success.json.summary.material === requestBody.material, "Expected summary material");
assert(success.json.summary.options.rush === true, "Expected rush option in summary");
assertNoInternalFields(success.json);

const invalid = await postJson({ width: 24, height: 18, material: "13-single" });
assert(invalid.status === 400, `Expected validation status 400, got ${invalid.status}`);
assert(invalid.json.ok === false, "Expected validation ok=false");
assert(invalid.json.error?.code === "VALIDATION_ERROR", "Expected validation error code");
assert(invalid.json.error?.fields?.quantity === "Required", "Expected quantity validation message");

console.log("Banner pricing API response shape passed.");
