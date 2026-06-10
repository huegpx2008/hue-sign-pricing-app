import { POST as postMeshBanner } from "../app/api/pricing/mesh-banner/route.js";
import { POST as postPoster } from "../app/api/pricing/poster/route.js";
import { POST as postAcrylic } from "../app/api/pricing/acrylic/route.js";
import { POST as postFoamcore } from "../app/api/pricing/foamcore/route.js";
import { POST as postPvc } from "../app/api/pricing/pvc/route.js";
import { POST as postPolystyrene } from "../app/api/pricing/polystyrene/route.js";
import { POST as postAluminum } from "../app/api/pricing/aluminum/route.js";
import { calculateGeneralSignPricing } from "../lib/pricing/general-signs.js";

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
    "shopPrice",
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
    "sheetPrice",
    "handlingFeeEach",
    "handlingFeeTotal",
    "costPerPiece",
    "standOffDirectCost",
    "standOffRetailCharge",
    "roundedCornersRetailFee",
    "roundedCornersDirectSqInFee",
    "roundedCornersDirectSheetFee",
    "sqInDirectCost",
    "fullSheetDirectCost",
    "fullSheetDirectMaterial",
    "fullSheetPriceEach",
    "optimizationSavings",
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

function baseExpected(product, body) {
  return {
    product,
    activeProduct: product,
    width: body.width,
    height: body.height,
    qty: body.quantity,
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

const cases = [
  {
    slug: "mesh-banner",
    post: postMeshBanner,
    product: "mesh-banner",
    body: { width: 120, height: 60, quantity: 3, polePocket: true, rope: true, webbing: true, grommets: true, welding: true, rush: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("meshBanner", body),
      meshPolePocket: true,
      meshGrommets: true,
      meshWelding: true,
      meshRope: true,
      meshWebbing: true,
      meshRush: true,
    }),
    expectedWarnings: 2,
  },
  {
    slug: "poster",
    post: postPoster,
    product: "poster",
    body: { width: 48, height: 96, quantity: 3, rush: true },
    expected: (body) => calculateGeneralSignPricing({ ...baseExpected("poster", body), posterRush: true }),
    expectedWarnings: 0,
  },
  {
    slug: "acrylic",
    post: postAcrylic,
    product: "acrylic",
    body: { width: 24, height: 36, quantity: 2, contourCut: true, roundedCorners: true, standOffs: true, standOffQty: 8, standOffColor: "black", rush: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("acrylic", body),
      acrylicContour: true,
      acrylicRoundedCorners: true,
      acrylicStandOffs: true,
      acrylicStandOffQty: 8,
      acrylicStandOffColor: "black",
    }),
    expectedWarnings: 1,
  },
  {
    slug: "foamcore",
    post: postFoamcore,
    product: "foamcore",
    body: { width: 24, height: 36, quantity: 9, sides: "double", contourCut: true, glossLaminate: true, rush: true, customCut: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("foamcore", body),
      foamcoreDouble: true,
      foamcoreContour: true,
      foamcoreGloss: true,
      foamcoreRush: true,
      foamcoreCustomCut: true,
    }),
    expectedWarnings: 1,
  },
  {
    slug: "pvc",
    post: postPvc,
    product: "pvc",
    body: { width: 18, height: 24, quantity: 16, thickness: "6mm", sides: "double", contourCut: true, rush: true, customCut: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("pvc", body),
      pvcType: "6-double",
      pvcContour: true,
      pvcRush: true,
      pvcCustomCut: true,
    }),
    expectedWarnings: 1,
  },
  {
    slug: "polystyrene",
    post: postPolystyrene,
    product: "polystyrene",
    body: { width: 18, height: 24, quantity: 16, sides: "double", contourCut: true, glossLaminate: true, rush: true, customCut: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("polystyrene", body),
      polystyreneDouble: true,
      polystyreneContour: true,
      polystyreneGloss: true,
      polystyreneRush: true,
      polystyreneCustomCut: true,
    }),
    expectedWarnings: 1,
  },
  {
    slug: "aluminum",
    post: postAluminum,
    product: "aluminum",
    body: { width: 24, height: 36, quantity: 12, thickness: "080", sides: "double", contourCut: true, roundedCorners: true, rush: true },
    expected: (body) => calculateGeneralSignPricing({
      ...baseExpected("aluminum", body),
      aluminumType: "080-double",
      acmContour: true,
      roundedCorners: true,
    }),
    expectedWarnings: 1,
  },
];

for (const testCase of cases) {
  const success = await postJson(testCase.post, testCase.slug, testCase.body);
  assert(success.status === 200, `${testCase.slug}: expected success status 200, got ${success.status}`);
  assert(success.json.ok === true, `${testCase.slug}: expected ok=true`);
  assert(success.json.product === testCase.product, `${testCase.slug}: expected product=${testCase.product}`);
  assert(success.json.currency === "USD", `${testCase.slug}: expected currency=USD`);
  assert(success.json.summary.width === testCase.body.width, `${testCase.slug}: expected summary width`);
  assert(success.json.summary.height === testCase.body.height, `${testCase.slug}: expected summary height`);
  assert(success.json.summary.quantity === testCase.body.quantity, `${testCase.slug}: expected summary quantity`);
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

console.log("Remaining general sign pricing API response shapes passed for 7 endpoints.");
