import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { calculateApparelLineCost, createApparelCatalog, parseApparelCatalogCsv, sortApparelSizes } from "../lib/catalog/apparel-catalog.js";
import { calculateEmbroideryPricing, PLUS_PER_1K, STITCH_MATRIX } from "../lib/pricing/embroidery.js";

const csvText = fs.readFileSync(path.resolve(process.cwd(), "public/data/SanMar_SDL_hue.csv"), "utf8");
const catalog = createApparelCatalog(parseApparelCatalogCsv(csvText));

const toNumber = (value) => Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, "")) || 0;
const QTIERS = [{ max: 5 }, { max: 11 }, { max: 23 }, { max: 35 }, { max: 71 }, { max: 143 }, { max: 287 }, { max: 575 }, { max: 999 }, { max: Infinity }];
const tierIndex = (qty) => QTIERS.findIndex((tier) => qty <= tier.max);

function getStyle(styleCode) {
  const style = [...catalog.stylesByKey.values()].find((entry) => entry.style.toLowerCase() === styleCode.toLowerCase());
  assert(style, `Expected catalog style ${styleCode}`);
  return style;
}

function pickColor(style) {
  const colors = [...new Set(style.rows.map((row) => row.color).filter(Boolean))];
  return colors.find((color) => color.toLowerCase() === "black") || colors[0];
}

function lineItemFor(styleCode, quantities, color = null) {
  const style = getStyle(styleCode);
  return {
    id: styleCode,
    styleKey: style.key,
    color: color || pickColor(style),
    sizeQty: quantities,
  };
}

function quantitiesFor(styleCode, requested) {
  const style = getStyle(styleCode);
  const sizes = sortApparelSizes(style.rows.map((row) => row.size));
  const output = {};
  for (const size of sizes) output[size] = String(requested[size] || 0);
  return output;
}

function legacyEmbroideryPricing(input, stylesCatalog) {
  const placements = input.placements || ["Left Chest"];
  const lineItems = input.manualMode ? [{
    id: "manual",
    style: input.manualName,
    title: input.manualName,
    color: input.manualColor,
    sizeQty: { OSFA: input.manualQty || "0" },
    totalQty: toNumber(input.manualQty),
    garmentCost: toNumber(input.manualQty) * toNumber(input.manualCostEach),
    sizePriceBreakdown: [{ size: "OSFA", qty: toNumber(input.manualQty), blankCasePrice: toNumber(input.manualCostEach) }],
    isCap: /cap|hat|beanie/i.test(`${input.manualName} ${placements.join(" ")}`),
  }] : input.lineItems.map((lineItem) => {
    const style = stylesCatalog.stylesByKey.get(lineItem.styleKey);
    return {
      ...calculateApparelLineCost(lineItem, stylesCatalog, { mode: "embroidery" }),
      isCap: /cap|hat|beanie/i.test(`${style?.title || ""} ${placements.join(" ")}`),
    };
  });
  const totalGarments = lineItems.reduce((sum, item) => sum + item.totalQty, 0);
  const idx = Math.max(tierIndex(totalGarments || 1), 0);
  const stitchCount = toNumber(input.stitchCount);
  const rounded = Math.min(Math.max(Math.ceil(stitchCount / 1000) * 1000, 5000), 15000);
  const base = (STITCH_MATRIX[rounded] || STITCH_MATRIX[15000])[idx];
  const extra1k = stitchCount > 15000 ? Math.ceil((stitchCount - 15000) / 1000) : 0;
  const stitchEach = stitchCount > 15000 ? STITCH_MATRIX[15000][idx] + extra1k * PLUS_PER_1K[idx] : base;
  const threadExtraEach = Math.max(toNumber(input.threadColors) - 2, 0) * 3;
  const namesEach = input.addNames ? (input.largeNames ? 8 : 6) : 0;
  const numbersEach = input.addNumbers ? (input.largeNumbers ? STITCH_MATRIX[5000][0] : 6) : 0;
  const puffEach = input.puff3mm ? 1.5 : 0;
  const embroideryEachDirect = stitchEach + threadExtraEach + namesEach + numbersEach + puffEach;
  const embroideryRetailEach = embroideryEachDirect / 0.4;
  const apparelCost = lineItems.reduce((sum, item) => sum + item.garmentCost, 0);
  const apparelRetail = apparelCost / 0.4;
  const embroiderySubtotal = embroideryRetailEach * totalGarments;
  const handlingDirect = 2;
  const handlingRetail = handlingDirect / 0.4;
  const hasCaps = lineItems.some((item) => item.isCap && item.totalQty > 0);
  const hasFlats = lineItems.some((item) => !item.isCap && item.totalQty > 0);
  const digitizingStatus = input.digitizingStatus || "Reorder / Digitized File On Hand";
  const digitizingFees = digitizingStatus.includes("Needs") ? ((hasCaps && hasFlats) ? 110 : 55) : 0;
  const calculatedRetail = apparelRetail + embroiderySubtotal + handlingRetail + digitizingFees;
  const targetRetailPerItem = toNumber(input.targetRetailPricePerItem);
  const targetRetailTotal = targetRetailPerItem > 0 ? targetRetailPerItem * totalGarments : 0;
  const retail = targetRetailPerItem > 0 ? targetRetailTotal : calculatedRetail;
  const cost = apparelCost + (embroideryEachDirect * totalGarments) + handlingDirect + digitizingFees;
  const lineItemsWithAlloc = lineItems.map((item) => {
    const per = item.totalQty ? ((item.garmentCost / 0.4) / item.totalQty) + embroideryRetailEach : 0;
    const tiers = (item.sizePriceBreakdown || []).map((tier) => ({
      label: ["S", "M", "L", "XL"].includes(tier.size) ? "S-XL" : tier.size,
      qty: tier.qty,
      priceEach: (tier.blankCasePrice / 0.4) + embroideryRetailEach,
    }));
    return { ...item, retailPerShirt: per, finalRetailSubtotal: per * item.totalQty, embroideryRetailEach, sizePriceBreakdown: tiers };
  });

  return {
    label: "Embroidery",
    retail,
    calculatedRetail,
    targetRetailPricePerItem: targetRetailPerItem > 0 ? targetRetailPerItem : null,
    targetRetailTotal: targetRetailPerItem > 0 ? targetRetailTotal : null,
    targetRetailDelta: targetRetailPerItem > 0 ? targetRetailTotal - calculatedRetail : 0,
    each: totalGarments ? retail / totalGarments : 0,
    cost,
    profit: retail - cost,
    margin: retail ? ((retail - cost) / retail) * 100 : 0,
    totalGarments,
    lineItems: lineItemsWithAlloc,
    stitchCount,
    threadColors: toNumber(input.threadColors),
    placements,
    digitizingFees,
    digitizingStatus,
    embroideryEachDirect,
    embroideryDirectTotal: embroideryEachDirect * totalGarments,
    embroideryRetailEach,
    embroideryRetailSubtotal: embroiderySubtotal,
    embroiderySubtotal,
    apparelDirectCost: apparelCost,
    apparelRetailSubtotal: apparelRetail,
    threadExtraEach,
    namesEach,
    numbersEach,
    puffEach,
    handlingDirect,
    stitchTierUsed: rounded,
    qtyTierIndex: idx,
    manualMode: Boolean(input.manualMode),
    minimumWarning: totalGarments > 0 && totalGarments < 5,
    adminNotes: [
      stitchCount > 15000 ? "Calculated using 15,000+ stitch formula" : "",
      input.largeNumbers ? "Large numbers use piece-price embroidery logic" : "",
    ].filter(Boolean),
  };
}

function assertPricingMatches(name, input) {
  const actual = calculateEmbroideryPricing(input, catalog);
  const expected = legacyEmbroideryPricing(input, catalog);
  assert.deepEqual(actual, expected, `${name} should match legacy embroidery pricing`);
}

const flatStyle = getStyle("K540");
const capStyle = getStyle("NE501");
const flatColor = pickColor(flatStyle);
const capColor = pickColor(capStyle);

const flatBasic = lineItemFor("K540", quantitiesFor("K540", { S: 2, M: 2, L: 1 }), flatColor);
const flatMedium = lineItemFor("K540", quantitiesFor("K540", { S: 6, M: 6, L: 6, XL: 6 }), flatColor);
const capBasic = lineItemFor("NE501", quantitiesFor("NE501", { OSFA: 12, "OSFA (M/L)": 12, "OSFA (L/XL)": 12 }), capColor);

assertPricingMatches("basic left chest 5000 stitches", {
  lineItems: [flatBasic],
  placements: ["Left Chest"],
  stitchCount: 5000,
  threadColors: 2,
  digitizingStatus: "Reorder / Digitized File On Hand",
});

assertPricingMatches("8000 stitches with thread colors", {
  lineItems: [flatMedium],
  placements: ["Left Chest"],
  stitchCount: 8000,
  threadColors: 4,
  digitizingStatus: "Reorder / Digitized File On Hand",
});

assertPricingMatches("15000 plus stitches", {
  lineItems: [flatMedium],
  placements: ["Full Back"],
  stitchCount: 17250,
  threadColors: 2,
  digitizingStatus: "Reorder / Digitized File On Hand",
});

assertPricingMatches("names numbers puff digitizing flat", {
  lineItems: [flatMedium],
  placements: ["Left Chest"],
  stitchCount: 10000,
  threadColors: 3,
  addNames: true,
  largeNames: true,
  addNumbers: true,
  largeNumbers: true,
  puff3mm: true,
  digitizingStatus: "New Logo / Needs Digitizing",
});

assertPricingMatches("cap-like item digitizing", {
  lineItems: [capBasic],
  placements: ["Hat Front"],
  stitchCount: 5000,
  threadColors: 2,
  digitizingStatus: "New Logo / Needs Digitizing",
});

assertPricingMatches("mixed cap and flat digitizing", {
  lineItems: [flatBasic, capBasic],
  placements: ["Hat Front"],
  stitchCount: 8000,
  threadColors: 3,
  digitizingStatus: "New Logo / Needs Digitizing",
});

console.log("Embroidery pricing engine parity passed for 6 cases.");
