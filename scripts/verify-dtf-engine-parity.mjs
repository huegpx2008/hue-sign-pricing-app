import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createApparelCatalog, findStyle, parseApparelCatalogCsv } from "../lib/catalog/apparel-catalog.js";
import { calculateDtfPricing } from "../lib/pricing/dtf.js";

const csvText = fs.readFileSync(path.resolve(process.cwd(), "public/data/SanMar_SDL_hue.csv"), "utf8");
const catalog = createApparelCatalog(parseApparelCatalogCsv(csvText));
const fixtures = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "tests/fixtures/dtf-engine-parity.json"), "utf8"));

const LEGACY = {
  DEFAULT_MARGIN_PERCENT: 60,
  DTF_MATERIAL_COST_PER_LINEAR_INCH: 0.5,
  DTF_MINIMUM_MATERIAL_CHARGE: 10,
  DTF_SHIPPING_FLAT: 10,
  DTF_SLEEVE_RETAIL_ADDON_EACH: 1,
  DTF_BYOA_RETAIL_FEE: 20,
  DTF_ROLL_WIDTH: 22,
  FRONT_PRESETS: {
    "Left Chest": { width: 4, height: 4 },
    "Full Front": { width: 11, height: 10 },
  },
  BACK_PRESETS: {
    "Full Back": { width: 12.5, height: 13 },
  },
  DEFAULT_SLEEVE_SIZE: { width: 3.5, height: 3.5 },
  SIZE_UPCHARGES: {
    "2XL": 2.5,
    "3XL": 3.5,
    "4XL": 4.5,
    "5XL": 5,
  },
};

function toNumber(value) {
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeLegacyInput(input = {}) {
  const apparel = input.apparel || {};
  return {
    dtfMode: input.dtfMode || input.mode || "standard",
    bringYourOwnApparel: Boolean(input.bringYourOwnApparel),
    style: apparel.style || input.style || "",
    color: apparel.color || input.color || "",
    sizes: {
      XS: apparel.sizes?.XS ?? input.XS ?? 0,
      S: apparel.sizes?.S ?? input.S ?? 0,
      M: apparel.sizes?.M ?? input.M ?? 0,
      L: apparel.sizes?.L ?? input.L ?? 0,
      XL: apparel.sizes?.XL ?? input.XL ?? 0,
      "2XL": apparel.sizes?.["2XL"] ?? input["2XL"] ?? 0,
      "3XL": apparel.sizes?.["3XL"] ?? input["3XL"] ?? 0,
      "4XL": apparel.sizes?.["4XL"] ?? input["4XL"] ?? 0,
      "5XL": apparel.sizes?.["5XL"] ?? input["5XL"] ?? 0,
    },
    apparelCost: apparel.apparelCost ?? input.apparelCost,
    dtfOnlyWidth: input.dtfOnlyWidth ?? 11,
    dtfOnlyHeight: input.dtfOnlyHeight ?? 10,
    dtfOnlyQty: input.dtfOnlyQty ?? 1,
    byoaTransferQty: input.byoaTransferQty ?? apparel.quantity ?? 1,
    frontPreset: input.frontPreset ?? "None",
    backPreset: input.backPreset ?? "None",
    frontWidth: input.frontWidth ?? 11,
    frontHeight: input.frontHeight ?? 10,
    backWidth: input.backWidth ?? 12.5,
    backHeight: input.backHeight ?? 13,
    leftSleeve: Boolean(input.leftSleeve),
    rightSleeve: Boolean(input.rightSleeve),
    leftSleeveCustomSize: Boolean(input.leftSleeveCustomSize),
    rightSleeveCustomSize: Boolean(input.rightSleeveCustomSize),
    leftSleeveWidth: input.leftSleeveWidth ?? LEGACY.DEFAULT_SLEEVE_SIZE.width,
    leftSleeveHeight: input.leftSleeveHeight ?? LEGACY.DEFAULT_SLEEVE_SIZE.height,
    rightSleeveWidth: input.rightSleeveWidth ?? LEGACY.DEFAULT_SLEEVE_SIZE.width,
    rightSleeveHeight: input.rightSleeveHeight ?? LEGACY.DEFAULT_SLEEVE_SIZE.height,
    padding: input.padding ?? 0.25,
    optimizeLayout: input.optimizeLayout ?? true,
  };
}

function findLegacySelectedProduct(input) {
  const styleGroup = findStyle(input.style, catalog);
  const matchedRows = (styleGroup?.rows || []).filter((row) => row.color === input.color);
  return matchedRows[0] || (styleGroup?.rows || [])[0] || null;
}

function legacyLayoutTransfers(items, rollWidth, padding, allowRotate) {
  const usableItems = items
    .map((item) => {
      const baseW = toNumber(item.width);
      const baseH = toNumber(item.height);
      const rotatedW = baseH;
      const rotatedH = baseW;

      let width = baseW;
      let height = baseH;
      let rotated = false;

      if (allowRotate) {
        const fitsBase = baseW <= rollWidth;
        const fitsRotated = rotatedW <= rollWidth;

        if (!fitsBase && fitsRotated) {
          width = rotatedW;
          height = rotatedH;
          rotated = true;
        } else if (fitsBase && fitsRotated && rotatedH < baseH) {
          width = rotatedW;
          height = rotatedH;
          rotated = true;
        }
      }

      return {
        ...item,
        width,
        height,
        rotated,
      };
    })
    .filter((item) => item.width > 0 && item.height > 0 && item.width <= rollWidth)
    .sort((a, b) => b.height - a.height || b.width - a.width);

  const rows = [];
  for (const item of usableItems) {
    const footprintW = item.width + padding;
    const footprintH = item.height + padding;
    let placed = false;

    for (const row of rows) {
      if (row.usedWidth + footprintW <= rollWidth + 0.0001) {
        row.items.push({ ...item, x: row.usedWidth, y: row.y, footprintW, footprintH });
        row.usedWidth += footprintW;
        row.height = Math.max(row.height, footprintH);
        placed = true;
        break;
      }
    }

    if (!placed) {
      const y = rows.reduce((sum, row) => sum + row.height, 0);
      rows.push({
        y,
        height: footprintH,
        usedWidth: footprintW,
        items: [{ ...item, x: 0, y, footprintW, footprintH }],
      });
    }
  }

  const rollLengthUsed = rows.reduce((sum, row) => sum + row.height, 0);
  const placements = rows.flatMap((row) => row.items);
  const rotationUsed = placements.some((p) => p.rotated);

  return {
    placements,
    rows,
    rollWidth,
    rollLengthUsed,
    totalTransfers: placements.length,
    linearInches: rollLengthUsed,
    rotationUsed,
  };
}

function resolveLegacySize(preset, width, height, presets) {
  if (preset === "Custom Size") return { width: toNumber(width), height: toNumber(height) };
  return presets[preset] || null;
}

function legacyDtfPricing(rawInput) {
  const input = normalizeLegacyInput(rawInput);
  const selectedProduct = findLegacySelectedProduct(input);
  const baseApparelCostUsed = input.dtfMode === "dtfOnly" || input.bringYourOwnApparel ? 0 : toNumber(input.apparelCost ?? selectedProduct?.casePrice ?? 0);
  const totalGarmentQty = input.dtfMode === "dtfOnly"
    ? Math.max(0, Math.floor(toNumber(input.dtfOnlyQty)))
    : (input.bringYourOwnApparel ? Math.max(0, Math.floor(toNumber(input.byoaTransferQty))) : (
      toNumber(input.sizes.XS)
      + toNumber(input.sizes.S)
      + toNumber(input.sizes.M)
      + toNumber(input.sizes.L)
      + toNumber(input.sizes.XL)
      + toNumber(input.sizes["2XL"])
      + toNumber(input.sizes["3XL"])
      + toNumber(input.sizes["4XL"])
      + toNumber(input.sizes["5XL"])
    ));
  const sizeUpchargeTotal = input.bringYourOwnApparel || input.dtfMode === "dtfOnly" ? 0 : (
    toNumber(input.sizes["2XL"]) * LEGACY.SIZE_UPCHARGES["2XL"]
    + toNumber(input.sizes["3XL"]) * LEGACY.SIZE_UPCHARGES["3XL"]
    + toNumber(input.sizes["4XL"]) * LEGACY.SIZE_UPCHARGES["4XL"]
    + toNumber(input.sizes["5XL"]) * LEGACY.SIZE_UPCHARGES["5XL"]
  );
  const apparelDirectCost = input.dtfMode === "dtfOnly" || input.bringYourOwnApparel ? 0 : totalGarmentQty * baseApparelCostUsed;
  const marginDecimal = LEGACY.DEFAULT_MARGIN_PERCENT / 100;
  const apparelRetailSubtotal = marginDecimal >= 1 ? 0 : apparelDirectCost / (1 - marginDecimal);
  const byoaRetailFee = input.dtfMode === "standard" && input.bringYourOwnApparel ? LEGACY.DTF_BYOA_RETAIL_FEE : 0;
  const frontSelected = input.frontPreset !== "None";
  const backSelected = input.backPreset !== "None";
  const resolvedFrontSize = resolveLegacySize(input.frontPreset, input.frontWidth, input.frontHeight, LEGACY.FRONT_PRESETS);
  const resolvedBackSize = resolveLegacySize(input.backPreset, input.backWidth, input.backHeight, LEGACY.BACK_PRESETS);
  const resolvedLeftSleeveSize = input.leftSleeveCustomSize
    ? { width: toNumber(input.leftSleeveWidth), height: toNumber(input.leftSleeveHeight) }
    : LEGACY.DEFAULT_SLEEVE_SIZE;
  const resolvedRightSleeveSize = input.rightSleeveCustomSize
    ? { width: toNumber(input.rightSleeveWidth), height: toNumber(input.rightSleeveHeight) }
    : LEGACY.DEFAULT_SLEEVE_SIZE;
  const transferCountPerGarment = input.dtfMode === "dtfOnly"
    ? 1
    : (frontSelected ? 1 : 0)
    + (backSelected ? 1 : 0)
    + (input.leftSleeve ? 1 : 0)
    + (input.rightSleeve ? 1 : 0);
  const totalTransferCount = transferCountPerGarment * totalGarmentQty;
  const sleevePrintsPerGarment = (input.leftSleeve ? 1 : 0) + (input.rightSleeve ? 1 : 0);
  const sleeveRetailAddOnTotal = sleevePrintsPerGarment * totalGarmentQty * LEGACY.DTF_SLEEVE_RETAIL_ADDON_EACH;

  const transferItems = [];
  const repeat = Math.max(0, Math.floor(totalGarmentQty));
  const pushRepeated = (transfer) => {
    for (let i = 0; i < repeat; i += 1) transferItems.push({ ...transfer, id: `${transfer.type}-${i}` });
  };
  if (input.dtfMode === "dtfOnly") {
    pushRepeated({ type: "dtfOnly", label: "DTF Transfer", width: toNumber(input.dtfOnlyWidth), height: toNumber(input.dtfOnlyHeight) });
  } else {
    if (frontSelected && resolvedFrontSize) pushRepeated({ type: "front", label: "Front", width: resolvedFrontSize.width, height: resolvedFrontSize.height });
    if (backSelected && resolvedBackSize) pushRepeated({ type: "back", label: "Back", width: resolvedBackSize.width, height: resolvedBackSize.height });
    if (input.leftSleeve) pushRepeated({ type: "leftSleeve", label: "Left Sleeve", width: resolvedLeftSleeveSize.width, height: resolvedLeftSleeveSize.height });
    if (input.rightSleeve) pushRepeated({ type: "rightSleeve", label: "Right Sleeve", width: resolvedRightSleeveSize.width, height: resolvedRightSleeveSize.height });
  }

  const safePadding = Math.max(0, toNumber(input.padding));
  const noRotation = legacyLayoutTransfers(transferItems, LEGACY.DTF_ROLL_WIDTH, safePadding, false);
  const withRotation = legacyLayoutTransfers(transferItems, LEGACY.DTF_ROLL_WIDTH, safePadding, true);
  const dtfLayout = input.optimizeLayout && withRotation.rollLengthUsed < noRotation.rollLengthUsed ? withRotation : noRotation;
  const runArea = dtfLayout.rollWidth * dtfLayout.rollLengthUsed;
  const usedTransferArea = dtfLayout.placements.reduce((sum, item) => sum + (item.width * item.height), 0);
  const dtfWasteSummary = {
    runArea,
    usedTransferArea,
    unusedArea: Math.max(0, runArea - usedTransferArea),
    unusedPercent: runArea > 0 ? ((Math.max(0, runArea - usedTransferArea) / runArea) * 100) : 0,
  };
  const dtfMaterialCost = Math.max(dtfLayout.linearInches * LEGACY.DTF_MATERIAL_COST_PER_LINEAR_INCH, LEGACY.DTF_MINIMUM_MATERIAL_CHARGE);
  const dtfRetailSubtotal = marginDecimal >= 1 ? 0 : dtfMaterialCost / (1 - marginDecimal);
  const directCost = apparelDirectCost + dtfMaterialCost + LEGACY.DTF_SHIPPING_FLAT;
  const finalRetail = apparelRetailSubtotal + dtfRetailSubtotal + sizeUpchargeTotal + sleeveRetailAddOnTotal + LEGACY.DTF_SHIPPING_FLAT + byoaRetailFee;
  const pricePerGarment = totalGarmentQty > 0 ? finalRetail / totalGarmentQty : 0;
  const sizePriceBreakdown = [
    { label: "S-XL", qty: toNumber(input.sizes.S) + toNumber(input.sizes.M) + toNumber(input.sizes.L) + toNumber(input.sizes.XL), upcharge: 0 },
    { label: "2XL", qty: toNumber(input.sizes["2XL"]), upcharge: 2.5 },
    { label: "3XL", qty: toNumber(input.sizes["3XL"]), upcharge: 3.5 },
    { label: "4XL", qty: toNumber(input.sizes["4XL"]), upcharge: 4.5 },
    { label: "5XL", qty: toNumber(input.sizes["5XL"]), upcharge: 5 },
  ].filter((tier) => tier.qty > 0).map((tier) => ({
    ...tier,
    priceEach: Math.max(0, pricePerGarment + tier.upcharge),
  }));

  return {
    label: input.dtfMode === "dtfOnly" ? "DTF Transfers Only" : "DTF Transfers",
    retail: finalRetail,
    each: pricePerGarment,
    cost: directCost,
    profit: finalRetail - directCost,
    margin: finalRetail ? ((finalRetail - directCost) / finalRetail) * 100 : 0,
    materialCost: apparelDirectCost + dtfMaterialCost,
    shipping: LEGACY.DTF_SHIPPING_FLAT,
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
    sizePriceBreakdown: input.bringYourOwnApparel ? [] : sizePriceBreakdown,
    sizeQuantities: input.bringYourOwnApparel ? {} : {
      XS: toNumber(input.sizes.XS),
      S: toNumber(input.sizes.S),
      M: toNumber(input.sizes.M),
      L: toNumber(input.sizes.L),
      XL: toNumber(input.sizes.XL),
      "2XL": toNumber(input.sizes["2XL"]),
      "3XL": toNumber(input.sizes["3XL"]),
      "4XL": toNumber(input.sizes["4XL"]),
      "5XL": toNumber(input.sizes["5XL"]),
    },
    apparelCostUsed: baseApparelCostUsed,
    totalGarmentQty,
    rollLengthUsed: dtfLayout.rollLengthUsed,
    transferCount: totalTransferCount,
    totalTransferCount,
    dtfLayout,
    dtfWasteSummary,
  };
}

function simplifyLayout(layout) {
  return {
    rollWidth: layout.rollWidth,
    rollLengthUsed: layout.rollLengthUsed,
    totalTransfers: layout.totalTransfers,
    linearInches: layout.linearInches,
    rotationUsed: layout.rotationUsed,
    placements: layout.placements.map((item) => ({
      type: item.type,
      label: item.label,
      width: item.width,
      height: item.height,
      rotated: item.rotated,
      x: item.x,
      y: item.y,
      footprintW: item.footprintW,
      footprintH: item.footprintH,
    })),
  };
}

function comparable(result) {
  return {
    label: result.label,
    retail: result.retail,
    each: result.each,
    cost: result.cost,
    profit: result.profit,
    margin: result.margin,
    materialCost: result.materialCost,
    shipping: result.shipping,
    apparelDirectCost: result.apparelDirectCost,
    apparelRetailSubtotal: result.apparelRetailSubtotal,
    byoaRetailFee: result.byoaRetailFee,
    dtfMode: result.dtfMode,
    bringYourOwnApparel: result.bringYourOwnApparel,
    dtfOnlyWidth: result.dtfOnlyWidth,
    dtfOnlyHeight: result.dtfOnlyHeight,
    dtfOnlyQty: result.dtfOnlyQty,
    byoaTransferQty: result.byoaTransferQty,
    dtfMaterialCost: result.dtfMaterialCost,
    dtfRetailSubtotal: result.dtfRetailSubtotal,
    sizeUpchargeTotal: result.sizeUpchargeTotal,
    sleeveRetailAddOnTotal: result.sleeveRetailAddOnTotal,
    directCost: result.directCost,
    finalRetail: result.finalRetail,
    pricePerGarment: result.pricePerGarment,
    sizePriceBreakdown: result.sizePriceBreakdown,
    sizeQuantities: result.sizeQuantities,
    apparelCostUsed: result.apparelCostUsed,
    totalGarmentQty: result.totalGarmentQty,
    rollLengthUsed: result.rollLengthUsed,
    transferCount: result.transferCount,
    totalTransferCount: result.totalTransferCount,
    dtfLayout: simplifyLayout(result.dtfLayout),
    dtfWasteSummary: result.dtfWasteSummary,
  };
}

for (const fixture of fixtures) {
  const actual = comparable(calculateDtfPricing(fixture.input, catalog));
  const expected = comparable(legacyDtfPricing(fixture.input));
  assert.deepEqual(actual, expected, `${fixture.name} should match legacy DTF pricing`);
}

console.log(`DTF pricing engine parity passed for ${fixtures.length} cases.`);
