import {
  findStyle,
  findVariantSize,
  getServerApparelCatalogStatus,
  loadApparelCatalog,
  normalizeCatalogSizeQuantities,
} from "../../../../lib/catalog/apparel-catalog.js";
import { calculateDtfPricing, dtfPricingConstants } from "../../../../lib/pricing/dtf.js";

export const runtime = "nodejs";

const placementLabels = {
  front: "Front",
  back: "Back",
  leftSleeve: "Left Sleeve",
  rightSleeve: "Right Sleeve",
  leftChest: "Left Chest",
  pocket: "Pocket",
  custom: "Custom",
};
const presetMap = {
  leftChest: "Left Chest",
  "Left Chest": "Left Chest",
  fullFront: "Full Front",
  "Full Front": "Full Front",
  fullBack: "Full Back",
  "Full Back": "Full Back",
  custom: "Custom Size",
  "Custom Size": "Custom Size",
  none: "None",
  None: "None",
};

let catalogLoader = loadApparelCatalog;

export function setDtfCatalogLoaderForTests(loader) {
  catalogLoader = loader || loadApparelCatalog;
}

const toBoolean = (value) => value === true;
const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

function normalizeSizeKey(size) {
  return String(size || "").trim().toUpperCase();
}

function normalizeMode(body) {
  return String(body?.mode || body?.dtfMode || "standard").trim();
}

function safeErrorDetails(error) {
  return error?.message ? String(error.message).slice(0, 500) : "Unexpected server error.";
}

async function logDtfError(error, body) {
  if (error?.suppressLog) return;
  const catalogStatus = await getServerApparelCatalogStatus();
  console.error("DTF pricing API error", {
    route: "POST /api/pricing/dtf",
    message: error?.message || String(error),
    stack: error?.stack || "",
    privateCatalogExists: catalogStatus.exists,
    privateCatalogPath: catalogStatus.resolvedPath,
    requestedStyleColor: {
      style: String(body?.apparel?.style || ""),
      color: String(body?.apparel?.color || ""),
    },
    mode: normalizeMode(body),
  });
}

function internalErrorResponse(error) {
  return Response.json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "DTF pricing failed.",
      details: safeErrorDetails(error),
    },
  }, { status: 500 });
}

function validationResponse(fields) {
  return Response.json({
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "DTF pricing input is invalid.",
      fields,
    },
  }, { status: 400 });
}

function validateSizes(sizes, prefix, fields) {
  if (!sizes || typeof sizes !== "object" || Array.isArray(sizes)) {
    fields[prefix] = "Required sizes object";
    return;
  }

  let positiveSizeCount = 0;
  for (const [size, quantity] of Object.entries(sizes)) {
    const normalizedSize = normalizeSizeKey(size);
    const parsedQuantity = Number(quantity);
    if (!normalizedSize) fields[prefix] = "Size names are required";
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) fields[`${prefix}.${size}`] = "Must be a non-negative number";
    if (parsedQuantity > 0) positiveSizeCount += 1;
  }

  if (positiveSizeCount === 0) fields[prefix] = "At least one size quantity must be greater than zero";
}

function getEnabledLocations(body) {
  const locations = Array.isArray(body?.printLocations) ? body.printLocations : [];
  return locations.filter((location) => location?.enabled !== false);
}

function validateLocation(location, index, fields) {
  const prefix = `printLocations.${index}`;
  const placement = String(location?.placement || "").trim();
  if (!placement) fields[`${prefix}.placement`] = "Required";
  if (placement && !placementLabels[placement]) fields[`${prefix}.placement`] = "Unsupported placement";

  const defaultPreset = ["leftSleeve", "rightSleeve", "leftChest"].includes(placement) ? "none" : "custom";
  const preset = location?.preset === undefined ? defaultPreset : String(location.preset).trim();
  const normalizedPreset = presetMap[preset];
  if (!normalizedPreset) fields[`${prefix}.preset`] = "Unsupported preset";

  if (normalizedPreset === "Custom Size" || placement === "pocket" || placement === "custom") {
    if (toPositiveNumber(location?.size?.width ?? location?.width) === null) fields[`${prefix}.size.width`] = "Must be a positive number";
    if (toPositiveNumber(location?.size?.height ?? location?.height) === null) fields[`${prefix}.size.height`] = "Must be a positive number";
  }
}

function validateStructure(body) {
  const fields = {};
  const mode = normalizeMode(body);
  const apparelSource = String(body?.apparel?.source || "catalog").trim();

  if (!["standard", "dtfOnly"].includes(mode)) fields.mode = "Must be standard or dtfOnly";

  if (mode === "dtfOnly") {
    if (toPositiveNumber(body?.transfer?.width ?? body?.dtfOnlyWidth) === null) fields["transfer.width"] = "Must be a positive number";
    if (toPositiveNumber(body?.transfer?.height ?? body?.dtfOnlyHeight) === null) fields["transfer.height"] = "Must be a positive number";
    if (toPositiveNumber(body?.transfer?.quantity ?? body?.dtfOnlyQty) === null) fields["transfer.quantity"] = "Must be a positive number";
  }

  if (mode === "standard") {
    if (!body?.apparel || typeof body.apparel !== "object" || Array.isArray(body.apparel)) {
      fields.apparel = "Required apparel object";
    } else if (apparelSource === "customerProvided") {
      if (toPositiveNumber(body.apparel.quantity ?? body.byoaTransferQty) === null) fields["apparel.quantity"] = "Must be a positive number";
    } else if (apparelSource === "catalog") {
      if (!body.apparel.style) fields["apparel.style"] = "Required";
      if (!body.apparel.color) fields["apparel.color"] = "Required";
      validateSizes(body.apparel.sizes, "apparel.sizes", fields);
    } else {
      fields["apparel.source"] = "Must be catalog or customerProvided";
    }

    if (body?.printLocations !== undefined && !Array.isArray(body.printLocations)) {
      fields.printLocations = "Must be an array when provided";
    } else {
      const enabledLocations = getEnabledLocations(body);
      if (enabledLocations.length === 0) fields.printLocations = "At least one enabled print location is required";
      (Array.isArray(body?.printLocations) ? body.printLocations : []).forEach((location, index) => {
        if (location?.enabled === false) return;
        validateLocation(location, index, fields);
      });
    }
  }

  if (body?.layout !== undefined && (!body.layout || typeof body.layout !== "object" || Array.isArray(body.layout))) {
    fields.layout = "Must be an object when provided";
  }
  if (body?.layout?.optimize !== undefined && typeof body.layout.optimize !== "boolean") {
    fields["layout.optimize"] = "Must be a boolean";
  }
  if (body?.artwork !== undefined && (!body.artwork || typeof body.artwork !== "object" || Array.isArray(body.artwork))) {
    fields.artwork = "Must be an object when provided";
  }
  if (body?.artwork?.supplied !== undefined && typeof body.artwork.supplied !== "boolean") {
    fields["artwork.supplied"] = "Must be a boolean";
  }
  if (body?.production !== undefined && (!body.production || typeof body.production !== "object" || Array.isArray(body.production))) {
    fields.production = "Must be an object when provided";
  }
  if (body?.production?.rush !== undefined && typeof body.production.rush !== "boolean") {
    fields["production.rush"] = "Must be a boolean";
  }

  return fields;
}

function validateCatalogMatches(input, catalog) {
  const fields = {};
  if (input.mode !== "standard" || input.apparel.source !== "catalog") return fields;

  const style = findStyle(input.apparel.style, catalog);
  if (!style) {
    fields["apparel.style"] = "Unknown style";
    return fields;
  }

  const colorRows = style.rows.filter((row) => row.color === input.apparel.color);
  if (!colorRows.length) {
    fields["apparel.color"] = "Unknown color for style";
    return fields;
  }

  for (const size of Object.keys(input.apparel.sizes)) {
    if (!findVariantSize(input.apparel.style, input.apparel.color, size, catalog)) {
      fields[`apparel.sizes.${size}`] = "No catalog price for style, color, and size";
    }
  }

  return fields;
}

function locationSize(location) {
  return {
    width: Number(location?.size?.width ?? location?.width),
    height: Number(location?.size?.height ?? location?.height),
  };
}

function applyLocationToEngineInput(engineInput, location) {
  const placement = String(location.placement || "").trim();
  const defaultPreset = ["leftSleeve", "rightSleeve", "leftChest"].includes(placement) ? "none" : "custom";
  const preset = presetMap[String(location.preset ?? defaultPreset).trim()] || "Custom Size";
  const size = locationSize(location);

  if (placement === "front") {
    engineInput.frontPreset = preset;
    if (preset === "Custom Size") {
      engineInput.frontWidth = size.width;
      engineInput.frontHeight = size.height;
    }
  } else if (placement === "back") {
    engineInput.backPreset = preset;
    if (preset === "Custom Size") {
      engineInput.backWidth = size.width;
      engineInput.backHeight = size.height;
    }
  } else if (placement === "leftChest") {
    engineInput.frontPreset = "Left Chest";
  } else if (placement === "pocket" || placement === "custom") {
    engineInput.frontPreset = "Custom Size";
    engineInput.frontWidth = size.width;
    engineInput.frontHeight = size.height;
  } else if (placement === "leftSleeve") {
    engineInput.leftSleeve = true;
    if (preset === "Custom Size" || location.size || location.width || location.height) {
      engineInput.leftSleeveCustomSize = true;
      engineInput.leftSleeveWidth = size.width;
      engineInput.leftSleeveHeight = size.height;
    }
  } else if (placement === "rightSleeve") {
    engineInput.rightSleeve = true;
    if (preset === "Custom Size" || location.size || location.width || location.height) {
      engineInput.rightSleeveCustomSize = true;
      engineInput.rightSleeveWidth = size.width;
      engineInput.rightSleeveHeight = size.height;
    }
  }
}

function normalizeInput(body, catalog) {
  const mode = normalizeMode(body);
  const source = String(body?.apparel?.source || "catalog").trim();
  const style = mode === "standard" && source === "catalog" ? findStyle(body.apparel.style, catalog) : null;
  const sizes = mode === "standard" && source === "catalog"
    ? normalizeCatalogSizeQuantities(body.apparel.style, body.apparel.color, body.apparel.sizes, catalog)
    : {};
  const engineInput = {
    dtfMode: mode,
    bringYourOwnApparel: source === "customerProvided",
    apparel: {
      source,
      style: String(body?.apparel?.style || "").trim(),
      styleKey: style?.key || "",
      color: String(body?.apparel?.color || "").trim(),
      sizes,
    },
    dtfOnlyWidth: body?.transfer?.width ?? body?.dtfOnlyWidth ?? 11,
    dtfOnlyHeight: body?.transfer?.height ?? body?.dtfOnlyHeight ?? 10,
    dtfOnlyQty: body?.transfer?.quantity ?? body?.dtfOnlyQty ?? 1,
    byoaTransferQty: body?.apparel?.quantity ?? body?.byoaTransferQty ?? 1,
    frontPreset: "None",
    backPreset: "None",
    leftSleeve: false,
    rightSleeve: false,
    padding: body?.layout?.padding ?? 0.25,
    optimizeLayout: body?.layout?.optimize ?? true,
  };

  if (mode === "standard") {
    for (const location of getEnabledLocations(body)) {
      applyLocationToEngineInput(engineInput, location);
    }
  }

  return {
    mode,
    apparel: {
      source,
      style: engineInput.apparel.style,
      color: engineInput.apparel.color,
      sizes: engineInput.apparel.sizes,
      quantity: Number(body?.apparel?.quantity ?? body?.byoaTransferQty ?? 0),
    },
    transfer: {
      width: Number(engineInput.dtfOnlyWidth),
      height: Number(engineInput.dtfOnlyHeight),
      quantity: Number(engineInput.dtfOnlyQty),
    },
    printLocations: mode === "standard" ? getEnabledLocations(body) : [],
    layout: {
      optimize: engineInput.optimizeLayout,
      padding: Number(engineInput.padding),
    },
    artwork: {
      supplied: toBoolean(body?.artwork?.supplied),
      status: String(body?.artwork?.status || (body?.artwork?.supplied ? "printReady" : "notSupplied")),
    },
    production: {
      rush: toBoolean(body?.production?.rush),
    },
    engineInput,
  };
}

function buildLocationSummary(input, calc) {
  if (input.mode === "dtfOnly") {
    return [{
      placement: "dtfOnly",
      label: "DTF Transfer",
      size: {
        width: calc.dtfOnlyWidth,
        height: calc.dtfOnlyHeight,
      },
    }];
  }

  const locations = [];
  if (calc.frontSelected && calc.resolvedFrontSize) {
    locations.push({
      placement: "front",
      label: calc.resolvedFrontSize.width === 4 && calc.resolvedFrontSize.height === 4 ? "Left Chest" : "Front",
      size: calc.resolvedFrontSize,
    });
  }
  if (calc.backSelected && calc.resolvedBackSize) {
    locations.push({
      placement: "back",
      label: "Back",
      size: calc.resolvedBackSize,
    });
  }
  if (calc.sleevePrintsPerGarment > 0) {
    if (calc.selectedPrintLocations.some((location) => location.startsWith("Left Sleeve"))) {
      locations.push({ placement: "leftSleeve", label: "Left Sleeve", size: calc.resolvedLeftSleeveSize });
    }
    if (calc.selectedPrintLocations.some((location) => location.startsWith("Right Sleeve"))) {
      locations.push({ placement: "rightSleeve", label: "Right Sleeve", size: calc.resolvedRightSleeveSize });
    }
  }
  return locations;
}

function buildSummary(input, calc) {
  const summary = {
    label: calc.label,
    mode: input.mode,
    totalQuantity: calc.totalGarmentQty,
    locations: buildLocationSummary(input, calc),
    layout: {
      optimize: input.layout.optimize,
      rollWidth: calc.dtfLayout.rollWidth,
      estimatedLinearInches: calc.dtfLayout.linearInches,
      totalTransfers: calc.transferCount,
      placedTransfers: calc.dtfLayout.totalTransfers,
      rotationUsed: calc.dtfLayout.rotationUsed,
    },
    options: {
      artworkSupplied: input.artwork.supplied,
      artworkStatus: input.artwork.status,
      rush: input.production.rush,
    },
  };

  if (input.mode === "dtfOnly") {
    summary.transfer = input.transfer;
  } else if (input.apparel.source === "customerProvided") {
    summary.apparel = {
      source: "customerProvided",
      quantity: calc.totalGarmentQty,
    };
  } else {
    summary.apparel = {
      source: "catalog",
      style: calc.selectedStyle,
      productName: calc.selectedTitle,
      color: calc.selectedColor,
      sizes: Object.fromEntries(Object.entries(calc.sizeQuantities || {}).filter(([, quantity]) => Number(quantity) > 0)),
    };
    summary.sizePriceBreakdown = (calc.sizePriceBreakdown || []).map((tier) => ({
      label: tier.label,
      quantity: tier.qty,
      priceEach: tier.priceEach,
    }));
  }

  return summary;
}

function buildWarnings(input, calc) {
  const warnings = [];

  if (!input.artwork.supplied || input.artwork.status !== "printReady") {
    warnings.push("Artwork may require review before production.");
  }

  if (input.production.rush) {
    warnings.push("Rush production requires confirmation and is not priced separately in this estimate.");
  }

  const tooWide = calc.dtfTransferItems.some((item) => Number(item.width) > dtfPricingConstants.DTF_ROLL_WIDTH);
  if (tooWide || calc.dtfLayout.totalTransfers < calc.transferCount) {
    warnings.push("One or more transfer sizes exceed the current DTF roll width and require review.");
  }

  const pocketRequested = input.printLocations.some((location) => location.placement === "pocket");
  if (pocketRequested) {
    warnings.push("Pocket print placement requires artwork and placement review.");
  }

  return warnings;
}

export async function POST(request) {
  let body;

  try {
    try {
      body = await request.json();
    } catch {
      return Response.json({
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      }, { status: 400 });
    }

    const structureFields = validateStructure(body);
    if (Object.keys(structureFields).length) return validationResponse(structureFields);

    const catalog = await catalogLoader();
    const input = normalizeInput(body, catalog);
    const catalogFields = validateCatalogMatches(input, catalog);
    if (Object.keys(catalogFields).length) return validationResponse(catalogFields);

    const calc = calculateDtfPricing(input.engineInput, catalog);

    return Response.json({
      ok: true,
      product: "dtf",
      price: {
        retail: calc.retail,
        each: calc.each,
      },
      currency: "USD",
      summary: buildSummary(input, calc),
      warnings: buildWarnings(input, calc),
    });
  } catch (error) {
    await logDtfError(error, body);
    return internalErrorResponse(error);
  }
}
