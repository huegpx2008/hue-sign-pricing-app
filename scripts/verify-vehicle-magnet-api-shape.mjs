import { POST } from "../app/api/pricing/vehicle-magnet/route.js";
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
    "costMarginPrice",
    "totalSqIn",
    "sqInEach",
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
  const request = new Request("http://localhost/api/pricing/vehicle-magnet", {
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
  width: 30,
  height: 18,
  quantity: 5,
  style: "contour-cut",
  rush: true,
};

const expected = calculateGeneralSignPricing({
  product: "vehicleMagnets",
  activeProduct: "vehicleMagnets",
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
  vehicleMagnetMode: "custom",
  vehicleMagnetPreset: "18x12",
  vehicleMagnetContour: true,
  vehicleMagnetRush: true,
});

const success = await postJson(requestBody);
assert(success.status === 200, `Expected success status 200, got ${success.status}`);
assert(success.json.ok === true, "Expected ok=true");
assert(success.json.product === "vehicle-magnet", "Expected product=vehicle-magnet");
assert(success.json.currency === "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match pricing engine");
assert(Array.isArray(success.json.warnings), "Expected warnings array");
assert(success.json.warnings.length === 0, "Expected no contour-cut warning");
assert(success.json.summary.style === requestBody.style, "Expected summary style");
assert(success.json.summary.options.contourCut === true, "Expected contourCut option in summary");
assert(success.json.summary.options.roundedCorners === false, "Expected roundedCorners false in summary");
assert(success.json.summary.options.rush === true, "Expected rush option in summary");
assertNoInternalFields(success.json);

const rounded = await postJson({
  width: 24,
  height: 12,
  quantity: 8,
  shape: "rounded-corners",
});
const roundedExpected = calculateGeneralSignPricing({
  product: "vehicleMagnets",
  activeProduct: "vehicleMagnets",
  width: 24,
  height: 12,
  qty: 8,
  margin: 60,
  multiplier: 1,
  useDesignFee: false,
  useSetupFee: false,
  designFee: "",
  setupFee: "",
  delivery: "",
  productMap: {},
  vehicleMagnetMode: "custom",
  vehicleMagnetPreset: "18x12",
  vehicleMagnetContour: false,
  vehicleMagnetRush: false,
});
assert(rounded.status === 200, `Expected rounded status 200, got ${rounded.status}`);
assert(Math.abs(rounded.json.price.retail - roundedExpected.retail) <= tolerance, "Rounded-corner retail does not match pricing engine");
assert(rounded.json.summary.style === "rounded-corners", "Expected rounded-corners style");
assert(rounded.json.warnings.length === 1, "Expected rounded-corners compatibility warning");
assertNoInternalFields(rounded.json);

const invalid = await postJson({ width: 24, height: 12, quantity: 1, style: "circle" });
assert(invalid.status === 400, `Expected validation status 400, got ${invalid.status}`);
assert(invalid.json.ok === false, "Expected validation ok=false");
assert(invalid.json.error?.code === "VALIDATION_ERROR", "Expected validation error code");
assert(invalid.json.error?.fields?.style === "Must be rectangle, rounded-corners, or contour-cut", "Expected style validation message");

const missing = await postJson({ width: 24, height: 12, style: "rectangle" });
assert(missing.status === 400, `Expected missing-field status 400, got ${missing.status}`);
assert(missing.json.error?.fields?.quantity === "Required", "Expected quantity required message");

console.log("Vehicle magnet pricing API response shape passed.");
