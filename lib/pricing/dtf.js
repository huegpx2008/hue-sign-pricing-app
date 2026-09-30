import { layoutDtfTransfers } from "./dtf-layout.js";
import { applySellingAdjustment } from "./pricing-layers.js";
import { calculateApparelLineCost } from "../catalog/apparel-catalog.js";

const toNumber = (value) => {
  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const dtfPricingConstants = {
  DEFAULT_MARGIN_PERCENT: 60,
  DTF_MATERIAL_COST_PER_LINEAR_INCH: 0.5,
  DTF_MINIMUM_MATERIAL_CHARGE: 10,
  DTF_SHIPPING_FLAT: 10,
  DTF_SLEEVE_RETAIL_ADDON_EACH: 1,
  DTF_BYOA_RETAIL_FEE: 20,
  DTF_ROLL_WIDTH: 22,
  DEFAULT_PADDING: 0.25,
  FRONT_PRESETS: {
    "Left Chest": { width: 4, height: 4 },
    "Full Front": { width: 11, height: 10 },
  },
  BACK_PRESETS: {
    "Full Back": { width: 12.5, height: 13 },
  },
  DEFAULT_SLEEVE_SIZE: { width: 3.5, height: 3.5 },
};

export { layoutDtfTransfers } from "./dtf-layout.js";

function normalizeSizeQuantities(sizes = {}, legacyInput = {}) {
  const quantities = Object.fromEntries(Object.entries(sizes).map(([size, quantity]) => [String(size).trim(), quantity]));
  const legacySizes = {
    XS: legacyInput.XS ?? legacyInput.qtyXs,
    S: legacyInput.S ?? legacyInput.qtyS,
    M: legacyInput.M ?? legacyInput.qtyM,
    L: legacyInput.L ?? legacyInput.qtyL,
    XL: legacyInput.XL ?? legacyInput.qtyXl,
    "2XL": legacyInput["2XL"] ?? legacyInput.qty2xl,
    "3XL": legacyInput["3XL"] ?? legacyInput.qty3xl,
    "4XL": legacyInput["4XL"] ?? legacyInput.qty4xl,
    "5XL": legacyInput["5XL"] ?? legacyInput.qty5xl,
  };

  for (const [size, legacyQuantity] of Object.entries(legacySizes)) {
    if (!(size in quantities)) quantities[size] = legacyQuantity ?? 0;
  }
  return quantities;
}

function resolvePrintSize(preset, customWidth, customHeight, presets) {
  if (preset === "Custom Size") {
    return { width: toNumber(customWidth), height: toNumber(customHeight) };
  }
  return presets[preset] || null;
}

export function normalizeDtfInput(input = {}) {
  const apparel = input.apparel || {};
  const transfer = input.transfer || {};
  const locations = input.locations || {};
  const front = input.front || locations.front || {};
  const back = input.back || locations.back || {};
  const leftSleeve = input.leftSleeve || locations.leftSleeve || {};
  const rightSleeve = input.rightSleeve || locations.rightSleeve || {};
  const sizeQuantities = normalizeSizeQuantities(apparel.sizes || apparel.sizeQty || input.sizes || input.sizeQuantities || {}, input);
  const dtfMode = input.dtfMode || input.mode || "standard";
  const bringYourOwnApparel = Boolean(input.bringYourOwnApparel || ["customerProvided", "decorationOnly"].includes(apparel.source));
  const frontPreset = front.preset ?? input.frontPreset ?? "None";
  const backPreset = back.preset ?? input.backPreset ?? "None";
  const leftSleeveEnabled = Boolean(leftSleeve.enabled ?? input.leftSleeve);
  const rightSleeveEnabled = Boolean(rightSleeve.enabled ?? input.rightSleeve);

  return {
    dtfMode,
    bringYourOwnApparel,
    decorationOnly: input.decorationOnly === true || apparel.source === "decorationOnly",
    apparel: {
      style: apparel.style ?? input.style ?? "",
      styleKey: apparel.styleKey ?? input.styleKey ?? "",
      color: apparel.color ?? input.color ?? "",
      sizes: sizeQuantities,
      apparelCost: apparel.apparelCost ?? input.apparelCost,
    },
    dtfOnlyWidth: transfer.width ?? input.dtfOnlyWidth ?? 11,
    dtfOnlyHeight: transfer.height ?? input.dtfOnlyHeight ?? 10,
    dtfOnlyQty: transfer.quantity ?? input.dtfOnlyQty ?? 1,
    byoaTransferQty: apparel.quantity ?? input.byoaTransferQty ?? 1,
    frontPreset,
    backPreset,
    frontWidth: front.size?.width ?? front.width ?? input.frontWidth ?? 11,
    frontHeight: front.size?.height ?? front.height ?? input.frontHeight ?? 10,
    backWidth: back.size?.width ?? back.width ?? input.backWidth ?? 12.5,
    backHeight: back.size?.height ?? back.height ?? input.backHeight ?? 13,
    leftSleeve: leftSleeveEnabled,
    rightSleeve: rightSleeveEnabled,
    leftSleeveCustomSize: Boolean(leftSleeve.customSize ?? input.leftSleeveCustomSize),
    rightSleeveCustomSize: Boolean(rightSleeve.customSize ?? input.rightSleeveCustomSize),
    leftSleeveWidth: leftSleeve.size?.width ?? leftSleeve.width ?? input.leftSleeveWidth ?? dtfPricingConstants.DEFAULT_SLEEVE_SIZE.width,
    leftSleeveHeight: leftSleeve.size?.height ?? leftSleeve.height ?? input.leftSleeveHeight ?? dtfPricingConstants.DEFAULT_SLEEVE_SIZE.height,
    rightSleeveWidth: rightSleeve.size?.width ?? rightSleeve.width ?? input.rightSleeveWidth ?? dtfPricingConstants.DEFAULT_SLEEVE_SIZE.width,
    rightSleeveHeight: rightSleeve.size?.height ?? rightSleeve.height ?? input.rightSleeveHeight ?? dtfPricingConstants.DEFAULT_SLEEVE_SIZE.height,
    padding: input.padding ?? input.layout?.padding ?? dtfPricingConstants.DEFAULT_PADDING,
    optimizeLayout: input.optimizeLayout ?? input.layout?.optimize ?? true,
  };
}

function buildDtfTransferItems(input, totalGarmentQty, resolvedSizes) {
  if (!totalGarmentQty) return [];
  const items = [];
  const repeat = Math.max(0, Math.floor(totalGarmentQty));
  const pushRepeated = (transfer) => {
    for (let i = 0; i < repeat; i += 1) items.push({ ...transfer, id: `${transfer.type}-${i}` });
  };

  if (input.dtfMode === "dtfOnly") {
    pushRepeated({ type: "dtfOnly", label: "DTF Transfer", width: toNumber(input.dtfOnlyWidth), height: toNumber(input.dtfOnlyHeight) });
    return items;
  }

  if (resolvedSizes.frontSelected && resolvedSizes.resolvedFrontSize) {
    pushRepeated({ type: "front", label: "Front", width: resolvedSizes.resolvedFrontSize.width, height: resolvedSizes.resolvedFrontSize.height });
  }
  if (resolvedSizes.backSelected && resolvedSizes.resolvedBackSize) {
    pushRepeated({ type: "back", label: "Back", width: resolvedSizes.resolvedBackSize.width, height: resolvedSizes.resolvedBackSize.height });
  }
  if (input.leftSleeve) {
    pushRepeated({ type: "leftSleeve", label: "Left Sleeve", width: resolvedSizes.resolvedLeftSleeveSize.width, height: resolvedSizes.resolvedLeftSleeveSize.height });
  }
  if (input.rightSleeve) {
    pushRepeated({ type: "rightSleeve", label: "Right Sleeve", width: resolvedSizes.resolvedRightSleeveSize.width, height: resolvedSizes.resolvedRightSleeveSize.height });
  }
  return items;
}

function calculateDtfWasteSummary(dtfLayout) {
  const runArea = dtfLayout.rollWidth * dtfLayout.rollLengthUsed;
  const usedTransferArea = dtfLayout.placements.reduce((sum, item) => sum + (item.width * item.height), 0);
  const unusedArea = Math.max(0, runArea - usedTransferArea);
  const unusedPercent = runArea > 0 ? (unusedArea / runArea) * 100 : 0;
  return { runArea, usedTransferArea, unusedArea, unusedPercent };
}

function calculateDtfPricingBase(rawInput = {}, catalog) {
  const settings = catalog?.pricing?.apparel?.dtf;
  const rates = settings ? {...dtfPricingConstants,
    DEFAULT_MARGIN_PERCENT: settings.marginPercent,
    DTF_MATERIAL_COST_PER_LINEAR_INCH: settings.materialPerLinearInch,
    DTF_MINIMUM_MATERIAL_CHARGE: settings.minimumMaterialCharge,
    DTF_SHIPPING_FLAT: settings.shipping,
    DTF_SLEEVE_RETAIL_ADDON_EACH: settings.sleeveRetailEach,
    DTF_BYOA_RETAIL_FEE: settings.customerGarmentFee,
    DTF_ROLL_WIDTH: settings.rollWidth,
    DEFAULT_PADDING: settings.padding,
  } : dtfPricingConstants;
  if (settings && rawInput.padding == null && rawInput.layout?.padding == null) rawInput = {...rawInput,padding:settings.padding};
  const input = normalizeDtfInput(rawInput);
  const sizeQuantities = input.apparel.sizes;
  const totalGarmentQty = input.dtfMode === "dtfOnly"
    ? Math.max(0, Math.floor(toNumber(input.dtfOnlyQty)))
    : (input.bringYourOwnApparel
      ? Math.max(0, Math.floor(toNumber(input.byoaTransferQty)))
      : Object.values(sizeQuantities).reduce((sum, quantity) => sum + toNumber(quantity), 0));

  const apparelLine = calculateApparelLineCost({
    style: input.apparel.style,
    styleKey: input.apparel.styleKey,
    color: input.apparel.color,
    sizes: sizeQuantities,
    apparelCost: input.apparel.apparelCost,
  }, catalog, { mode: "dtf" });

  const baseApparelCostUsed = input.dtfMode === "dtfOnly" || input.bringYourOwnApparel ? 0 : apparelLine.apparelCostUsed;
  const sizeUpchargeTotal = input.bringYourOwnApparel || input.dtfMode === "dtfOnly" ? 0 : apparelLine.sizeUpchargeTotal;
  const apparelDirectCost = input.dtfMode === "dtfOnly" || input.bringYourOwnApparel ? 0 : apparelLine.garmentCost;
  const marginDecimal = rates.DEFAULT_MARGIN_PERCENT / 100;
  const apparelRetailSubtotal = marginDecimal >= 1 ? 0 : apparelDirectCost / (1 - marginDecimal);
  const byoaRetailFee = input.dtfMode === "standard" && input.bringYourOwnApparel && !input.decorationOnly ? rates.DTF_BYOA_RETAIL_FEE : 0;

  const frontSelected = input.frontPreset !== "None";
  const backSelected = input.backPreset !== "None";
  const resolvedFrontSize = resolvePrintSize(input.frontPreset, input.frontWidth, input.frontHeight, rates.FRONT_PRESETS);
  const resolvedBackSize = resolvePrintSize(input.backPreset, input.backWidth, input.backHeight, rates.BACK_PRESETS);
  const resolvedLeftSleeveSize = input.leftSleeveCustomSize
    ? { width: toNumber(input.leftSleeveWidth), height: toNumber(input.leftSleeveHeight) }
    : rates.DEFAULT_SLEEVE_SIZE;
  const resolvedRightSleeveSize = input.rightSleeveCustomSize
    ? { width: toNumber(input.rightSleeveWidth), height: toNumber(input.rightSleeveHeight) }
    : rates.DEFAULT_SLEEVE_SIZE;

  const transferCountPerGarment = input.dtfMode === "dtfOnly"
    ? 1
    : (frontSelected ? 1 : 0)
    + (backSelected ? 1 : 0)
    + (input.leftSleeve ? 1 : 0)
    + (input.rightSleeve ? 1 : 0);
  const totalTransferCount = transferCountPerGarment * totalGarmentQty;
  const sleevePrintsPerGarment = (input.leftSleeve ? 1 : 0) + (input.rightSleeve ? 1 : 0);
  const sleeveRetailAddOnTotal = sleevePrintsPerGarment * totalGarmentQty * rates.DTF_SLEEVE_RETAIL_ADDON_EACH;

  const dtfTransferItems = buildDtfTransferItems(input, totalGarmentQty, {
    frontSelected,
    backSelected,
    resolvedFrontSize,
    resolvedBackSize,
    resolvedLeftSleeveSize,
    resolvedRightSleeveSize,
  });
  const safePadding = Math.max(0, toNumber(input.padding));
  const dtfLayout = layoutDtfTransfers(dtfTransferItems, rates.DTF_ROLL_WIDTH, safePadding, Boolean(input.optimizeLayout));
  const dtfWasteSummary = calculateDtfWasteSummary(dtfLayout);
  const dtfMaterialCost = Math.max(
    dtfLayout.linearInches * rates.DTF_MATERIAL_COST_PER_LINEAR_INCH,
    rates.DTF_MINIMUM_MATERIAL_CHARGE,
  );
  const dtfRetailSubtotal = marginDecimal >= 1 ? 0 : dtfMaterialCost / (1 - marginDecimal);
  const directCost = apparelDirectCost + dtfMaterialCost + rates.DTF_SHIPPING_FLAT;
  const finalRetail = apparelRetailSubtotal + dtfRetailSubtotal + sizeUpchargeTotal + sleeveRetailAddOnTotal + rates.DTF_SHIPPING_FLAT + byoaRetailFee;
  const pricePerGarment = totalGarmentQty > 0 ? finalRetail / totalGarmentQty : 0;
  // Allocate shared print/shipping charges once, then price each actual blank size.
  const sharedRetailEach = totalGarmentQty > 0 ? (dtfRetailSubtotal + sleeveRetailAddOnTotal + rates.DTF_SHIPPING_FLAT) / totalGarmentQty : 0;
  const dtfSizePriceBreakdown = input.bringYourOwnApparel || input.dtfMode === "dtfOnly" ? [] : apparelLine.sizePriceBreakdown.map((tier) => ({
    label: tier.size,
    qty: tier.qty,
    blankCasePrice: tier.blankCasePrice,
    priceEach: tier.blankCasePrice / (1 - marginDecimal) + sharedRetailEach,
  }));
  const pricingErrors = input.bringYourOwnApparel || input.dtfMode === "dtfOnly" ? [] : apparelLine.missingSizes.map((size) => "No supplier garment cost for size " + size + ". Select an available size or enter an explicit garment cost override.");

  const selectedPrintLocations = [
    frontSelected ? `Front ${resolvedFrontSize ? `(${resolvedFrontSize.width}" x ${resolvedFrontSize.height}")` : ""}` : null,
    backSelected ? `Back ${resolvedBackSize ? `(${resolvedBackSize.width}" x ${resolvedBackSize.height}")` : ""}` : null,
    input.leftSleeve ? `Left Sleeve (${resolvedLeftSleeveSize.width}" x ${resolvedLeftSleeveSize.height}")` : null,
    input.rightSleeve ? `Right Sleeve (${resolvedRightSleeveSize.width}" x ${resolvedRightSleeveSize.height}")` : null,
  ].filter(Boolean);

  return {
    pricingErrors,
    label: input.dtfMode === "dtfOnly" ? "DTF Transfers Only" : "DTF Transfers",
    retail: finalRetail,
    each: pricePerGarment,
    cost: directCost,
    profit: finalRetail - directCost,
    margin: finalRetail ? ((finalRetail - directCost) / finalRetail) * 100 : 0,
    materialCost: apparelDirectCost + dtfMaterialCost,
    shipping: rates.DTF_SHIPPING_FLAT,
    apparelDirectCost,
    apparelRetailSubtotal,
    byoaRetailFee,
    dtfMode: input.dtfMode,
    bringYourOwnApparel: input.bringYourOwnApparel,
    dtfOnlyWidth: toNumber(input.dtfOnlyWidth),
    dtfOnlyHeight: toNumber(input.dtfOnlyHeight),
    dtfOnlyQty: Math.max(0, Math.floor(toNumber(input.dtfOnlyQty))),
    byoaTransferQty: Math.max(0, Math.floor(toNumber(input.byoaTransferQty))),
    dtfMaterialCost,
    dtfRetailSubtotal,
    sizeUpchargeTotal,
    sleeveRetailAddOnTotal,
    directCost,
    finalRetail,
    pricePerGarment,
    sizePriceBreakdown: input.bringYourOwnApparel ? [] : dtfSizePriceBreakdown,
    selectedProduct: apparelLine.selectedProduct || null,
    productDisplay: input.bringYourOwnApparel ? "Customer Provided Items" : (apparelLine.selectedProduct ? `${apparelLine.selectedProduct.style} — ${apparelLine.selectedProduct.title} (${apparelLine.selectedProduct.color})` : "No SanMar item selected"),
    selectedStyle: input.bringYourOwnApparel ? "Customer Provided Items" : (apparelLine.selectedProduct?.style || ""),
    selectedTitle: input.bringYourOwnApparel ? "Customer Provided Items" : (apparelLine.selectedProduct?.title || ""),
    selectedColor: input.bringYourOwnApparel ? "Customer Provided Items" : (apparelLine.selectedProduct?.color || ""),
    sizeQuantities: input.bringYourOwnApparel ? {} : Object.fromEntries(
      Object.entries(sizeQuantities).map(([size, quantity]) => [size, toNumber(quantity)]),
    ),
    apparelCostUsed: baseApparelCostUsed,
    totalGarmentQty,
    selectedPrintLocations,
    rollLengthUsed: dtfLayout.rollLengthUsed,
    transferCount: totalTransferCount,
    transferCountPerGarment,
    totalTransferCount,
    sleevePrintsPerGarment,
    dtfTransferItems,
    dtfLayout,
    dtfWasteSummary,
    frontSelected,
    backSelected,
    resolvedFrontSize,
    resolvedBackSize,
    resolvedLeftSleeveSize,
    resolvedRightSleeveSize,
    padding: safePadding,
    optimizeLayout: Boolean(input.optimizeLayout),
  };
}

export function calculateDtfPricing(input,catalog) { return applySellingAdjustment(calculateDtfPricingBase(input,catalog),catalog?.pricing,"dtf"); }
