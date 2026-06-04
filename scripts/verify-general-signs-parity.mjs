import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateGeneralSignPricing } from "../lib/pricing/general-signs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const fixturePath = path.join(repoRoot, "tests", "fixtures", "general-sign-pricing-parity.json");
const update = process.argv.includes("--update");
const tolerance = 1e-9;

const handheldPaperSize = { key: "7x5", label: '7"x5"', perSheet: 12, w: 7, h: 5 };

const baseInput = {
  product: "",
  width: 24,
  height: 18,
  qty: 1,
  margin: 60,
  multiplier: 1,
  useDesignFee: false,
  useSetupFee: false,
  designFee: "",
  setupFee: "",
  delivery: "",
  activeProduct: null,
  productMap: {},
  coroDouble: false,
  coroFlute: "vertical",
  stakes: false,
  heavyStakes: false,
  grommets: false,
  gloss: false,
  coroContour: false,
  coroRush: false,
  bannerType: "13-single",
  polePocket: false,
  rope: false,
  windSlits: false,
  bannerRush: false,
  meshPolePocket: false,
  meshGrommets: false,
  meshWelding: false,
  meshRope: false,
  meshWebbing: false,
  meshRush: false,
  acmType: "3-single",
  aluminumType: "040-single",
  acmContour: false,
  roundedCorners: false,
  acrylicContour: false,
  acrylicRoundedCorners: false,
  acrylicStandOffs: false,
  acrylicStandOffQty: 4,
  acrylicStandOffColor: "silver",
  vinylType: "gf-standard",
  vinylLaminate: "Gloss Laminate",
  vinylContour: false,
  vinylRush: false,
  gangVinyl: false,
  contourPadding: 0.5,
  gangWastePercent: 15,
  posterRush: false,
  foamcoreDouble: false,
  foamcoreContour: false,
  foamcoreGloss: false,
  foamcoreRush: false,
  foamcoreCustomCut: false,
  pvcType: "3-single",
  pvcContour: false,
  pvcRush: false,
  pvcCustomCut: false,
  polystyreneDouble: false,
  polystyreneContour: false,
  polystyreneGloss: false,
  polystyreneRush: false,
  polystyreneCustomCut: false,
  vehicleMagnetMode: "standard",
  vehicleMagnetPreset: "18x12",
  vehicleMagnetContour: false,
  vehicleMagnetRush: false,
  businessCardQty: 250,
  businessCardSides: "single",
  businessCardRush: false,
  handheldPaperSize,
  handheldPaperSides: "single",
  handheldPaperRush: false,
  carbonlessFormType: "2 Part",
  carbonlessSize: '8.5" x 11"',
  carbonlessQty: 100,
  carbonlessPrintType: "Black Ink",
  carbonlessPrintSides: "Front Only",
  carbonlessNumbering: false,
  carbonlessWraparound: false,
  carbonlessBookedSets: false,
  carbonlessRush: false,
  doorHangerSize: "3.5 x 8.5",
  doorHangerQty: 500,
  doorHangerType: "14pt Gloss Front - Uncoated Back",
  doorHangerInk: "Standard Black",
  doorHangerBackPrinting: "No",
  doorHangerPerforation: "No",
  doorHangerShrinkWrap: "Shrink Wrap 250",
};

const cases = [
  ["banner-options", { product: "banner", activeProduct: "banner", width: 72, height: 36, qty: 2, bannerType: "18-double", polePocket: true, rope: true, windSlits: true, bannerRush: true, useDesignFee: true, designFee: 25 }],
  ["mesh-banner-large", { product: "meshBanner", activeProduct: "meshBanner", width: 120, height: 60, qty: 3, meshPolePocket: true, meshRope: true, meshWebbing: true, meshRush: true, delivery: 30 }],
  ["acm-contour-rounded", { product: "acm", activeProduct: "acm", width: 32, height: 48, qty: 4, acmType: "6-double", acmContour: true, roundedCorners: true }],
  ["aluminum-full-sheet-recommendation", { product: "aluminum", activeProduct: "aluminum", width: 24, height: 36, qty: 12, aluminumType: "080-double", acmContour: true, roundedCorners: true }],
  ["acrylic-standoffs", { product: "acrylic", activeProduct: "acrylic", width: 24, height: 36, qty: 2, acrylicContour: true, acrylicRoundedCorners: true, acrylicStandOffs: true, acrylicStandOffQty: 8, acrylicStandOffColor: "black" }],
  ["vinyl-ganged-contour", { product: "vinyl", activeProduct: "vinyl", width: 14, height: 10, qty: 35, vinylType: "3m-premium", vinylContour: true, vinylRush: true, gangVinyl: true, contourPadding: 0.75, gangWastePercent: 20 }],
  ["reflective-vinyl", { product: "reflective", activeProduct: "reflective", width: 24, height: 18, qty: 6, vinylContour: true, gangVinyl: true, gangWastePercent: 10 }],
  ["footprints-vinyl", { product: "footprints", activeProduct: "footprints", width: 12, height: 12, qty: 20, vinylContour: true, gangVinyl: false }],
  ["poster-rush", { product: "poster", activeProduct: "poster", width: 48, height: 96, qty: 3, posterRush: true }],
  ["coroplast-yard-signs", { product: "coro", activeProduct: "coro", width: 24, height: 18, qty: 50, coroDouble: true, stakes: true, heavyStakes: true, grommets: true, gloss: true, coroContour: true }],
  ["custom-cut-coroplast", { product: "coroSigns", activeProduct: "coro", width: 20, height: 30, qty: 18, coroDouble: false, coroFlute: "best", stakes: true, grommets: true, coroContour: true, coroRush: true }],
  ["vehicle-magnet-standard", { product: "vehicleMagnets", activeProduct: "vehicleMagnets", width: 18, height: 12, qty: 24, vehicleMagnetMode: "standard", vehicleMagnetPreset: "24x18", vehicleMagnetRush: true }],
  ["vehicle-magnet-custom", { product: "vehicleMagnets", activeProduct: "vehicleMagnets", width: 30, height: 18, qty: 5, vehicleMagnetMode: "custom", vehicleMagnetContour: true }],
  ["foamcore-full-sheet", { product: "foamcore", activeProduct: "foamcore", width: 24, height: 36, qty: 9, foamcoreDouble: true, foamcoreContour: true, foamcoreGloss: true, foamcoreRush: true }],
  ["pvc-full-sheet", { product: "pvc", activeProduct: "pvc", width: 18, height: 24, qty: 16, pvcType: "6-double", pvcContour: true, pvcRush: true }],
  ["polystyrene-full-sheet", { product: "polystyrene", activeProduct: "polystyrene", width: 18, height: 24, qty: 16, polystyreneDouble: true, polystyreneContour: true, polystyreneGloss: true, polystyreneRush: true }],
  ["business-cards", { product: "businessCards", activeProduct: "businessCards", businessCardQty: 1000, businessCardSides: "double", businessCardRush: true, useSetupFee: true, setupFee: 10 }],
  ["handheld-paper", { product: "handheld16ptPaper", activeProduct: "handheld16ptPaper", qty: 37, handheldPaperSize, handheldPaperSides: "double", handheldPaperRush: true }],
  ["carbonless-forms", { product: "carbonless", activeProduct: "carbonless", carbonlessFormType: "3 Part", carbonlessSize: '8.5" x 14"', carbonlessQty: 2500, carbonlessPrintType: "Full Color", carbonlessPrintSides: "Front and Back", carbonlessNumbering: true, carbonlessWraparound: true, carbonlessBookedSets: true, carbonlessRush: true }],
  ["door-hangers", { product: "doorHangers", activeProduct: "doorHangers", doorHangerSize: "4 x 11", doorHangerQty: 2500, doorHangerInk: "Full Color", doorHangerBackPrinting: "Full Color", doorHangerPerforation: "Yes (2 Perforations)", doorHangerShrinkWrap: "Shrink Wrap 50s" }],
];

function toJsonSnapshot(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSnapshot() {
  return {
    generatedFrom: "legacy general sign calculator before public API extraction",
    caseCount: cases.length,
    cases: cases.map(([id, input]) => {
      const normalizedInput = { ...baseInput, ...input };
      return {
        id,
        input: normalizedInput,
        expected: toJsonSnapshot(calculateGeneralSignPricing(normalizedInput)),
      };
    }),
  };
}

function compare(actual, expected, trail = "") {
  const diffs = [];
  const actualType = actual === null ? "null" : Array.isArray(actual) ? "array" : typeof actual;
  const expectedType = expected === null ? "null" : Array.isArray(expected) ? "array" : typeof expected;
  if (actualType !== expectedType) {
    return [`${trail || "<root>"} type mismatch: ${actualType} !== ${expectedType}`];
  }
  if (expectedType === "number") {
    if (!Number.isFinite(actual) || !Number.isFinite(expected) || Math.abs(actual - expected) > tolerance) {
      return [`${trail || "<root>"} number mismatch: ${actual} !== ${expected}`];
    }
    return [];
  }
  if (expectedType !== "object" && expectedType !== "array") {
    return Object.is(actual, expected) ? [] : [`${trail || "<root>"} mismatch: ${actual} !== ${expected}`];
  }
  const keys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
  for (const key of [...keys].sort()) {
    const nextTrail = trail ? `${trail}.${key}` : key;
    if (!(key in actual)) diffs.push(`${nextTrail} missing from actual`);
    else if (!(key in expected)) diffs.push(`${nextTrail} extra in actual`);
    else diffs.push(...compare(actual[key], expected[key], nextTrail));
  }
  return diffs;
}

if (update) {
  fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
  fs.writeFileSync(fixturePath, `${JSON.stringify(buildSnapshot(), null, 2)}\n`);
  console.log(`Updated ${path.relative(repoRoot, fixturePath)} with ${cases.length} general sign parity cases.`);
  process.exit(0);
}

if (!fs.existsSync(fixturePath)) {
  console.error(`Missing fixture file: ${path.relative(repoRoot, fixturePath)}`);
  console.error("Run `npm run test:pricing -- --update` to create the baseline intentionally.");
  process.exit(1);
}

const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const fixtureCases = new Map((fixture.cases || []).map((testCase) => [testCase.id, testCase]));
const failures = [];

for (const [id, input] of cases) {
  const fixtureCase = fixtureCases.get(id);
  if (!fixtureCase) {
    failures.push(`${id}: missing from fixture`);
    continue;
  }
  const normalizedInput = { ...baseInput, ...input };
  const actual = toJsonSnapshot(calculateGeneralSignPricing(normalizedInput));
  const diffs = compare(actual, fixtureCase.expected);
  if (diffs.length) {
    failures.push(`${id}:\n  ${diffs.join("\n  ")}`);
  }
}

if (failures.length) {
  console.error(`General sign pricing parity failed (${failures.length} case(s)).`);
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log(`General sign pricing parity passed for ${cases.length} cases.`);
