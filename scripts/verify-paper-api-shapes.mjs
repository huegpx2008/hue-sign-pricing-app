import { POST as postBusinessCard } from "../app/api/pricing/business-card/route.js";
import { POST as postHandheldPaper } from "../app/api/pricing/handheld-paper/route.js";
import { POST as postCarbonless } from "../app/api/pricing/carbonless/route.js";
import { POST as postDoorHanger } from "../app/api/pricing/door-hanger/route.js";
import { calculateGeneralSignPricing } from "../lib/pricing/general-signs.js";
import { handheldPaperSizes } from "../lib/pricing/paper-api.js";

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
    "shipping",
    "supplierCost",
    "supplierRate",
    "basePrice",
    "sheetsRounded",
    "piecesPerSheet",
    "nextFullSheetQty",
    "addMoreQty",
    "costMarginPrice",
    "areaEach",
    "ratePerSqIn",
    "retailMultiplier",
    "rushMultiplier",
    "optionBreakdown",
    "internalBreakdown",
  ]);

  if (!value || typeof value !== "object") return;

  for (const [key, nested] of Object.entries(value)) {
    const path = `${trail}.${key}`;
    assert(!blocked.has(key), `Internal field leaked: ${path}`);
    assertNoInternalFields(nested, path);
  }
}

async function postJson(post, slug, body) {
  const request = new Request(`http://localhost/api/pricing/${slug}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const response = await post(request);
  return {
    status: response.status,
    json: await response.json(),
  };
}

function baseExpected(product) {
  return {
    product,
    activeProduct: product,
    width: 0,
    height: 0,
    qty: 1,
    margin: 60,
    multiplier: 1,
    useDesignFee: false,
    useSetupFee: false,
    designFee: "",
    setupFee: "",
    delivery: "",
    productMap: {},
  };
}

const handheldSize = handheldPaperSizes.find((size) => size.key === "9x6");

const cases = [
  {
    slug: "business-card",
    post: postBusinessCard,
    product: "business-card",
    body: { quantity: 1000, sides: "double", coating: "Gloss Laminate", orientation: "Landscape", rush: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("businessCards"),
      businessCardQty: body.quantity,
      businessCardSides: body.sides,
      businessCardRush: body.rush,
    }),
    expectedWarnings: 2,
  },
  {
    slug: "handheld-paper",
    post: postHandheldPaper,
    product: "handheld-paper",
    body: { quantity: 275, size: "9x6", sides: "double", coating: "No Coating", orientation: "Portrait", rush: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("handheld16ptPaper"),
      qty: body.quantity,
      handheldPaperSize: handheldSize,
      handheldPaperSides: body.sides,
      handheldPaperRush: body.rush,
    }),
    expectedWarnings: 3,
  },
  {
    slug: "carbonless",
    post: postCarbonless,
    product: "carbonless",
    body: {
      formType: "3 Part",
      size: "8.5\" x 14\"",
      quantity: 2500,
      printType: "Full Color",
      printSides: "Front and Back",
      numbering: true,
      wraparound: true,
      bookedSets: true,
      rush: true,
    },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("carbonless"),
      carbonlessFormType: body.formType,
      carbonlessSize: body.size,
      carbonlessQty: body.quantity,
      carbonlessPrintType: body.printType,
      carbonlessPrintSides: body.printSides,
      carbonlessNumbering: body.numbering,
      carbonlessWraparound: body.wraparound,
      carbonlessBookedSets: body.bookedSets,
      carbonlessRush: body.rush,
    }),
    expectedWarnings: 0,
  },
  {
    slug: "door-hanger",
    post: postDoorHanger,
    product: "door-hanger",
    body: {
      size: "4 x 11",
      quantity: 2500,
      type: "14pt Gloss Front - Uncoated Back",
      ink: "Full Color",
      backPrinting: "Full Color",
      perforation: "Yes (2 Perforations)",
      shrinkWrap: "Shrink Wrap 50s",
    },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("doorHangers"),
      doorHangerSize: body.size,
      doorHangerQty: body.quantity,
      doorHangerType: body.type,
      doorHangerInk: body.ink,
      doorHangerBackPrinting: body.backPrinting,
      doorHangerPerforation: body.perforation,
      doorHangerShrinkWrap: body.shrinkWrap,
    }),
    expectedWarnings: 1,
  },
];

for (const testCase of cases) {
  const success = await postJson(testCase.post, testCase.slug, testCase.body);
  assert(success.status === 200, `${testCase.slug}: expected status 200, got ${success.status}`);
  assert(success.json.ok === true, `${testCase.slug}: expected ok=true`);
  assert(success.json.product === testCase.product, `${testCase.slug}: expected product=${testCase.product}`);
  assert(success.json.currency === "USD", `${testCase.slug}: expected currency=USD`);
  assert(Array.isArray(success.json.warnings), `${testCase.slug}: expected warnings array`);
  assert(success.json.warnings.length === testCase.expectedWarnings, `${testCase.slug}: expected ${testCase.expectedWarnings} warnings`);
  assertNoInternalFields(success.json);

  const expected = testCase.expected(testCase.body);
  assert(Math.abs(success.json.price.retail - expected.retail) <= tolerance, `${testCase.slug}: retail does not match pricing engine`);
  assert(Math.abs(success.json.price.each - expected.each) <= tolerance, `${testCase.slug}: each does not match pricing engine`);

  const invalid = await postJson(testCase.post, testCase.slug, { ...testCase.body, quantity: "" });
  assert(invalid.status === 400, `${testCase.slug}: expected validation status 400, got ${invalid.status}`);
  assert(invalid.json.ok === false, `${testCase.slug}: expected validation ok=false`);
  assert(invalid.json.error?.code === "VALIDATION_ERROR", `${testCase.slug}: expected validation error code`);
  assert(invalid.json.error?.fields?.quantity === "Required", `${testCase.slug}: expected quantity required message`);
}

console.log("Paper pricing API response shapes passed for 4 endpoints.");
