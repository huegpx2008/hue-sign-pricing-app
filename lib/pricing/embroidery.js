import { calculateApparelLineCost } from "../catalog/apparel-catalog.js";

export const STITCH_MATRIX = {
  5000: [6, 4, 3.75, 3, 2.75, 2.5, 2.25, 2.05, 1.95, 1.9],
  6000: [6.5, 4.5, 4.15, 3.4, 3.05, 2.8, 2.45, 2.25, 2.15, 2.1],
  7000: [7, 5, 4.55, 3.8, 3.35, 3.1, 2.65, 2.45, 2.35, 2.3],
  8000: [7.5, 5.5, 4.95, 4.2, 3.65, 3.4, 2.85, 2.65, 2.55, 2.5],
  9000: [8, 6, 5.35, 4.6, 3.95, 3.7, 3.05, 2.85, 2.75, 2.7],
  10000: [8.5, 6.5, 5.75, 5, 4.25, 4, 3.25, 3.05, 2.95, 2.9],
  11000: [9, 7, 6.15, 5.4, 4.55, 4.3, 3.45, 3.25, 3.15, 3.1],
  12000: [9.5, 7.5, 6.55, 5.8, 4.85, 4.6, 3.65, 3.45, 3.35, 3.3],
  13000: [10, 8, 6.95, 6.2, 5.15, 4.9, 3.85, 3.65, 3.55, 3.5],
  14000: [10.5, 8.5, 7.35, 6.6, 5.45, 5.2, 4.05, 3.85, 3.75, 3.7],
  15000: [11, 9, 7.75, 7, 5.75, 5.5, 4.25, 4.05, 3.95, 3.9],
};

export const PLUS_PER_1K = [0.5, 0.5, 0.4, 0.4, 0.3, 0.3, 0.2, 0.2, 0.2, 0.2];
export const QTIERS = [{ max: 5 }, { max: 11 }, { max: 23 }, { max: 35 }, { max: 71 }, { max: 143 }, { max: 287 }, { max: 575 }, { max: 999 }, { max: Infinity }];
export const PLACEMENTS = ["Left Chest", "Center Chest", "Full Back", "Sleeve", "Hat Front", "Hat Side", "Beanie", "Custom Placement"];

const toNumber = (value) => Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, "")) || 0;
const tierIndex = (qty) => QTIERS.findIndex((tier) => qty <= tier.max);
const isCapLike = (value) => /cap|hat|beanie/i.test(String(value || ""));

function buildLineItems(input, catalog) {
  const placements = input.placements || ["Left Chest"];

  if (input.manualMode) {
    return [{
      id: "manual",
      style: input.manualName,
      title: input.manualName,
      color: input.manualColor,
      sizeQty: { OSFA: input.manualQty || "0" },
      totalQty: toNumber(input.manualQty),
      garmentCost: toNumber(input.manualQty) * toNumber(input.manualCostEach),
      sizePriceBreakdown: [{ size: "OSFA", qty: toNumber(input.manualQty), blankCasePrice: toNumber(input.manualCostEach) }],
      isCap: isCapLike(`${input.manualName} ${placements.join(" ")}`),
    }];
  }

  return (input.lineItems || []).map((lineItem) => {
    const styleGroup = catalog?.stylesByKey?.get(lineItem.styleKey);
    return {
      ...calculateApparelLineCost(lineItem, catalog, { mode: "embroidery" }),
      isCap: isCapLike(`${styleGroup?.title || ""} ${placements.join(" ")}`),
    };
  });
}

export function calculateEmbroideryPricing(input, catalog) {
  const placements = input.placements || ["Left Chest"];
  const lineItems = buildLineItems(input, catalog);
  const totalGarments = lineItems.reduce((sum, item) => sum + item.totalQty, 0);
  const qtyTierIndex = Math.max(tierIndex(totalGarments || 1), 0);
  const stitchCount = toNumber(input.stitchCount);
  const rounded = Math.min(Math.max(Math.ceil(stitchCount / 1000) * 1000, 5000), 15000);
  const base = (STITCH_MATRIX[rounded] || STITCH_MATRIX[15000])[qtyTierIndex];
  const extra1k = stitchCount > 15000 ? Math.ceil((stitchCount - 15000) / 1000) : 0;
  const stitchEach = stitchCount > 15000 ? STITCH_MATRIX[15000][qtyTierIndex] + extra1k * PLUS_PER_1K[qtyTierIndex] : base;
  const threadColors = toNumber(input.threadColors);
  const threadExtraEach = Math.max(threadColors - 2, 0) * 3;
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
    return {
      ...item,
      retailPerShirt: per,
      finalRetailSubtotal: per * item.totalQty,
      embroideryRetailEach,
      sizePriceBreakdown: tiers,
    };
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
    threadColors,
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
    qtyTierIndex,
    manualMode: Boolean(input.manualMode),
    minimumWarning: totalGarments > 0 && totalGarments < 5,
    adminNotes: [
      stitchCount > 15000 ? "Calculated using 15,000+ stitch formula" : "",
      input.largeNumbers ? "Large numbers use piece-price embroidery logic" : "",
    ].filter(Boolean),
  };
}

export const embroideryPricingConstants = {
  STITCH_MATRIX,
  PLUS_PER_1K,
  QTIERS,
  PLACEMENTS,
};
