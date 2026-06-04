import { POST } from "../app/api/pricing/custom-cut-coroplast/route.js";
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
    "sheetsUsed",
    "sheetsRounded",
    "piecesPerSheet",
    "sheetLayout",
    "sheetAcross",
    "sheetDown",
    "sheetRotated",
    "previewPieceW",
    "previewPieceH",
    "stakeCost",
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
  const request = new Request("http://localhost/api/pricing/custom-cut-coroplast", {
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
  width: 20,
  height: 30,
  quantity: 18,
  thickness: "10mm",
  sides: "double",
  contourCut: true,
  glossLaminate: true,
  grommets: true,
  stakeType: "heavy-duty",
  rush: true,
  fluteDirection: "best",
};

const expected = calculateGeneralSignPricing({
  product: "coroSigns",
  activeProduct: "coro",
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
  coroDouble: true,
  coroFlute: "best",
  stakes: false,
  heavyStakes: true,
  grommets: true,
  gloss: true,
  coroContour: true,
  coroRush: true,
});

const success = await postJson(requestBody);
assert(success.status === 200, `Expected success status 200, got ${success.status}`);
assert(success.json.ok === true, "Expected ok=true");
assert(success.json.product === "custom-cut-coroplast", "Expected product=custom-cut-coroplast");
assert(success.json.currency === "USD", "Expected currency=USD");
assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, "Retail does not match pricing engine");
assert(Math.abs(success.json.price.each - expected.each) <= tolerance, "Each price does not match pricing engine");
assert(Array.isArray(success.json.warnings), "Expected warnings array");
assert(success.json.warnings.length === 2, "Expected thickness/gloss warnings");
assert(success.json.summary.thickness === requestBody.thickness.toLowerCase(), "Expected normalized thickness");
assert(success.json.summary.sides === requestBody.sides, "Expected summary sides");
assert(success.json.summary.fluteDirection === requestBody.fluteDirection, "Expected fluteDirection");
assert(success.json.summary.options.contourCut === true, "Expected contourCut option in summary");
assert(success.json.summary.options.glossLaminate === true, "Expected glossLaminate option in summary");
assert(success.json.summary.options.grommets === true, "Expected grommets option in summary");
assert(success.json.summary.options.stakeType === "heavy-duty", "Expected stakeType option in summary");
assert(success.json.summary.options.rush === true, "Expected rush option in summary");
assertNoInternalFields(success.json);

const standardStake = await postJson({
  width: 24,
  height: 18,
  quantity: 12,
  thickness: "4mm",
  sides: "single",
  stakeType: "standard",
});
const standardStakeExpected = calculateGeneralSignPricing({
  product: "coroSigns",
  activeProduct: "coro",
  width: 24,
  height: 18,
  qty: 12,
  margin: 60,
  multiplier: 1,
  useDesignFee: false,
  useSetupFee: false,
  designFee: "",
  setupFee: "",
  delivery: "",
  productMap: {},
  coroDouble: false,
  coroFlute: "best",
  stakes: true,
  heavyStakes: false,
  grommets: false,
  gloss: false,
  coroContour: false,
  coroRush: false,
});
assert(standardStake.status === 200, `Expected standard stake status 200, got ${standardStake.status}`);
assert(Math.abs(standardStake.json.price.retail - standardStakeExpected.retail) <= tolerance, "Standard stake retail does not match pricing engine");
assert(standardStake.json.summary.options.stakeType === "standard", "Expected standard stakeType");
assertNoInternalFields(standardStake.json);

const invalid = await postJson({ width: 24, height: 18, quantity: 1, thickness: "6mm", sides: "single" });
assert(invalid.status === 400, `Expected validation status 400, got ${invalid.status}`);
assert(invalid.json.ok === false, "Expected validation ok=false");
assert(invalid.json.error?.code === "VALIDATION_ERROR", "Expected validation error code");
assert(invalid.json.error?.fields?.thickness === "Must be 4mm or 10mm", "Expected thickness validation message");

const missing = await postJson({ width: 24, height: 18, thickness: "4mm", sides: "single" });
assert(missing.status === 400, `Expected missing-field status 400, got ${missing.status}`);
assert(missing.json.error?.fields?.quantity === "Required", "Expected quantity required message");

console.log("Custom-cut Coroplast pricing API response shape passed.");
