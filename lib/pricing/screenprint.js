import { calculateApparelLineCost } from "../catalog/apparel-catalog.js";

const QTY_TIERS = [24, 50, 100, 150, 200, 250, 300];
const SINGLE_SIDE = {
  24: { 1: 6.5, 2: 7, 3: 7.5, 4: 8 },
  50: { 1: 5.85, 2: 6.3, 3: 6.75, 4: 7.2 },
  100: { 1: 5.53, 2: 5.95, 3: 6.38, 4: 6.8 },
  150: { 1: 5.2, 2: 5.6, 3: 6, 4: 6.4 },
  200: { 1: 4.88, 2: 5.25, 3: 5.63, 4: 6 },
  250: { 1: 4.55, 2: 4.9, 3: 5.25, 4: 5.6 },
  300: { 1: 4.23, 2: 4.55, 3: 4.88, 4: 5.2 },
};
const ADD_SIDE = {
  24: { 1: 2, 2: 2.5, 3: 3, 4: 3.5 },
  50: { 1: 1.8, 2: 2.25, 3: 2.7, 4: 3.15 },
  100: { 1: 1.7, 2: 2.13, 3: 2.55, 4: 2.98 },
  150: { 1: 1.6, 2: 2, 3: 2.4, 4: 2.8 },
  200: { 1: 1.5, 2: 1.88, 3: 2.25, 4: 2.63 },
  250: { 1: 1.4, 2: 1.75, 3: 2.1, 4: 2.45 },
  300: { 1: 1.3, 2: 1.63, 3: 1.95, 4: 2.28 },
};

const PRODUCT_MARKUP_MULTIPLIER = 1.15;
const SETUP_FEE = 25;

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const tier = (quantity) => QTY_TIERS.reduce((active, candidate) => (quantity >= candidate ? candidate : active), QTY_TIERS[0]);

function normalizeLocation(location, index) {
  const colors = Math.max(1, Math.min(4, Math.floor(toNumber(location?.colors) || 1)));
  return {
    id: index + 1,
    name: String(location?.name || (index === 0 ? "Front" : "Back")).trim(),
    colors,
  };
}

function calculatePrintLines(locations, quantity) {
  const activeTier = tier(quantity);
  return locations.map((location, index) => {
    const matrix = index === 0 ? SINGLE_SIDE : ADD_SIDE;
    const pricePerPrint = matrix[activeTier]?.[location.colors] || 0;
    return {
      name: location.name,
      colors: location.colors,
      pricingType: index === 0 ? "First Side" : "Additional Side",
      pricePerPrint,
      subtotal: pricePerPrint * quantity,
    };
  });
}

function calculateScreenprintGroup(lineItems, locations, setupFeeEnabled) {
  const totalGarments = lineItems.reduce((sum, item) => sum + item.totalQty, 0);
  const lineItemsWithRetail = lineItems.map((item) => {
    const casePrice = item.totalQty ? item.garmentCost / item.totalQty : 0;
    const markedUpGarmentPrice = casePrice * PRODUCT_MARKUP_MULTIPLIER;
    return {
      ...item,
      casePrice,
      markedUpGarmentPrice,
      garmentRetail: item.garmentCost * PRODUCT_MARKUP_MULTIPLIER,
    };
  });

  const apparelDirectCost = lineItemsWithRetail.reduce((sum, item) => sum + item.garmentCost, 0);
  const apparelRetailSubtotal = lineItemsWithRetail.reduce((sum, item) => sum + item.garmentRetail, 0);
  const printLines = calculatePrintLines(locations, totalGarments);
  const printChargeSubtotal = printLines.reduce((sum, line) => sum + line.subtotal, 0);
  const setupFee = setupFeeEnabled ? SETUP_FEE : 0;
  const retail = apparelRetailSubtotal + printChargeSubtotal + setupFee;

  return {
    retail,
    totalGarments,
    apparelDirectCost,
    apparelRetailSubtotal,
    printChargeSubtotal,
    setupFee,
    printLines,
  };
}

export function calculateScreenprintPricing(input, catalog) {
  const locations = (input.locations?.length ? input.locations : [{ name: "Front", colors: 1 }]).map(normalizeLocation);
  const setupFeeEnabled = input.setupFeeEnabled !== false;
  const sameDesign = input.sameDesign !== false;
  const apparelLineItems = input.lineItems.map((lineItem) => calculateApparelLineCost({
    style: lineItem.style,
    color: lineItem.color,
    sizes: lineItem.sizes,
  }, catalog, { mode: "screen" }));

  const groups = sameDesign
    ? [calculateScreenprintGroup(apparelLineItems, locations, setupFeeEnabled)]
    : apparelLineItems.map((lineItem) => calculateScreenprintGroup([lineItem], locations, setupFeeEnabled));

  const retail = groups.reduce((sum, group) => sum + group.retail, 0);
  const totalGarments = apparelLineItems.reduce((sum, item) => sum + item.totalQty, 0);
  const printChargeSubtotal = groups.reduce((sum, group) => sum + group.printChargeSubtotal, 0);
  const setupFee = groups.reduce((sum, group) => sum + group.setupFee, 0);
  const apparelRetailSubtotal = groups.reduce((sum, group) => sum + group.apparelRetailSubtotal, 0);
  const apparelDirectCost = groups.reduce((sum, group) => sum + group.apparelDirectCost, 0);

  return {
    retail,
    each: totalGarments ? retail / totalGarments : 0,
    totalGarments,
    apparelDirectCost,
    apparelRetailSubtotal,
    printChargeSubtotal,
    setupFee,
    lineItems: apparelLineItems,
    printLines: groups.flatMap((group) => group.printLines),
    groups,
    averagePricePerShirt: totalGarments ? (apparelRetailSubtotal + printChargeSubtotal) / totalGarments : 0,
    productMarkupPercent: 115,
    decorationMethod: "screen",
  };
}

export const screenprintPricingConstants = {
  QTY_TIERS,
  SINGLE_SIDE,
  ADD_SIDE,
  PRODUCT_MARKUP_MULTIPLIER,
  SETUP_FEE,
};
