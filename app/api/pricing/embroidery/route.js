import { findStyle, findVariantSize, getServerApparelCatalogStatus, loadApparelCatalog, sortApparelSizes } from "../../../../lib/catalog/apparel-catalog.js";
import { calculateEmbroideryPricing } from "../../../../lib/pricing/embroidery.js";

export const runtime = "nodejs";

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const toBoolean = (value) => value === true;
let catalogLoader = loadApparelCatalog;

export function setEmbroideryCatalogLoaderForTests(loader) {
  catalogLoader = loader || loadApparelCatalog;
}

function getRequestedStylesColors(body) {
  const lineItems = Array.isArray(body?.lineItems) ? body.lineItems : [];
  return lineItems.map((item) => ({
    style: String(item?.style || "").trim(),
    color: String(item?.color || "").trim(),
  })).filter((item) => item.style || item.color);
}

function safeErrorDetails(error) {
  return error?.message ? String(error.message).slice(0, 500) : "Unexpected server error.";
}

async function logEmbroideryError(error, body) {
  if (error?.suppressLog) return;
  const catalogStatus = await getServerApparelCatalogStatus();
  console.error("Embroidery pricing API error", {
    route: "POST /api/pricing/embroidery",
    message: error?.message || String(error),
    stack: error?.stack || "",
    privateCatalogExists: catalogStatus.exists,
    privateCatalogPath: catalogStatus.resolvedPath,
    requestedStylesColors: getRequestedStylesColors(body),
  });
}

function internalErrorResponse(error) {
  return Response.json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Embroidery pricing failed.",
      details: safeErrorDetails(error),
    },
  }, { status: 500 });
}

function validateBooleanObject(body, key, fields) {
  const value = body?.[key];
  if (value === undefined) return;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fields[key] = "Must be an object when provided";
    return;
  }
  if (value.enabled !== undefined && typeof value.enabled !== "boolean") fields[`${key}.enabled`] = "Must be a boolean";
  if (value.large !== undefined && typeof value.large !== "boolean") fields[`${key}.large`] = "Must be a boolean";
}

function validateStructure(body) {
  const fields = {};

  if (!Array.isArray(body?.lineItems) || body.lineItems.length === 0) {
    fields.lineItems = "At least one garment line item is required";
  }

  const lineItems = Array.isArray(body?.lineItems) ? body.lineItems : [];
  lineItems.forEach((item, index) => {
    const prefix = `lineItems.${index}`;
    if (!item?.style) fields[`${prefix}.style`] = "Required";
    if (!item?.color) fields[`${prefix}.color`] = "Required";
    if (!item?.sizes || typeof item.sizes !== "object" || Array.isArray(item.sizes)) {
      fields[`${prefix}.sizes`] = "Required sizes object";
      return;
    }

    let positiveSizeCount = 0;
    for (const [size, quantity] of Object.entries(item.sizes)) {
      const parsedQuantity = Number(quantity);
      if (!String(size || "").trim()) fields[`${prefix}.sizes`] = "Size names are required";
      if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) fields[`${prefix}.sizes.${size}`] = "Must be a non-negative number";
      if (parsedQuantity > 0) positiveSizeCount += 1;
    }

    if (positiveSizeCount === 0) fields[`${prefix}.sizes`] = "At least one size quantity must be greater than zero";
  });

  if (!Array.isArray(body?.locations) || body.locations.length === 0) {
    fields.locations = "At least one embroidery location is required";
  }

  const locations = Array.isArray(body?.locations) ? body.locations : [];
  locations.forEach((location, index) => {
    const prefix = `locations.${index}`;
    if (!location?.placement) fields[`${prefix}.placement`] = "Required";
    if (toPositiveNumber(location?.stitchCount) === null) fields[`${prefix}.stitchCount`] = "Must be a positive number";
    if (toPositiveNumber(location?.threadColors) === null) fields[`${prefix}.threadColors`] = "Must be a positive number";
    if (location?.puff3mm !== undefined && typeof location.puff3mm !== "boolean") fields[`${prefix}.puff3mm`] = "Must be a boolean";
  });

  if (body?.digitizingRequired !== undefined && typeof body.digitizingRequired !== "boolean") {
    fields.digitizingRequired = "Must be a boolean";
  }

  validateBooleanObject(body, "names", fields);
  validateBooleanObject(body, "numbers", fields);

  return fields;
}

function normalizeSizeMap(sizes) {
  return Object.fromEntries(Object.entries(sizes || {}).map(([size, quantity]) => [
    String(size).trim().toUpperCase(),
    Number(quantity),
  ]));
}

function validateCatalogMatches(input, catalog) {
  const fields = {};

  input.lineItems.forEach((item, index) => {
    const style = findStyle(item.style, catalog);
    const prefix = `lineItems.${index}`;

    if (!style) {
      fields[`${prefix}.style`] = "Unknown style";
      return;
    }

    const colorRows = style.rows.filter((row) => row.color === item.color);
    if (!colorRows.length) {
      fields[`${prefix}.color`] = "Unknown color for style";
      return;
    }

    for (const [size, quantity] of Object.entries(item.sizes)) {
      if (quantity <= 0) continue;
      if (!findVariantSize(item.style, item.color, size, catalog)) {
        fields[`${prefix}.sizes.${size}`] = "No catalog price for style, color, and size";
      }
    }
  });

  return fields;
}

function normalizeInput(body, catalog) {
  const firstLocation = body.locations[0];
  return {
    lineItems: body.lineItems.map((item, index) => {
      const style = findStyle(item.style, catalog);
      const sizes = normalizeSizeMap(item.sizes);
      const styleSizes = sortApparelSizes((style?.rows || []).map((row) => row.size));
      return {
        id: `api-${index}`,
        style: String(item.style).trim(),
        styleKey: style?.key || "",
        color: String(item.color).trim(),
        sizeQty: Object.fromEntries(styleSizes.map((size) => [size, String(sizes[size] || 0)])),
      };
    }),
    placements: [String(firstLocation.placement).trim()],
    stitchCount: Number(firstLocation.stitchCount),
    threadColors: Number(firstLocation.threadColors),
    puff3mm: toBoolean(firstLocation.puff3mm),
    digitizingStatus: body.digitizingRequired === true ? "New Logo / Needs Digitizing" : "Reorder / Digitized File On Hand",
    addNames: toBoolean(body.names?.enabled),
    largeNames: toBoolean(body.names?.large),
    addNumbers: toBoolean(body.numbers?.enabled),
    largeNumbers: toBoolean(body.numbers?.large),
  };
}

function buildWarnings(body, input, calc) {
  const warnings = [];

  if (Array.isArray(body.locations) && body.locations.length > 1) {
    warnings.push("Multiple embroidery locations were submitted; this estimate uses the first location and requires review.");
  }

  if (calc.minimumWarning) {
    warnings.push("Embroidery quantities below 5 pieces may require review.");
  }

  if (body.digitizingRequired === true) {
    warnings.push("Digitizing was included for this estimate and final artwork may require review.");
  }

  if (input.puff3mm) {
    warnings.push("3mm puff embroidery may require artwork and garment review.");
  }

  return warnings;
}

function buildSummary(input, calc) {
  return {
    label: "Embroidery",
    totalQuantity: calc.totalGarments,
    lineItems: calc.lineItems.map((item) => ({
      style: item.style,
      productName: item.title,
      color: item.color,
      quantity: item.totalQty,
      sizes: Object.fromEntries(Object.entries(item.sizeQty || {})
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([size, quantity]) => [size, Number(quantity)])),
    })),
    location: {
      placement: input.placements[0],
      stitchCount: calc.stitchCount,
      threadColors: calc.threadColors,
      puff3mm: input.puff3mm,
    },
    options: {
      digitizingRequired: input.digitizingStatus.includes("Needs"),
      names: {
        enabled: input.addNames,
        large: input.largeNames,
      },
      numbers: {
        enabled: input.addNumbers,
        large: input.largeNumbers,
      },
    },
  };
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
    if (Object.keys(structureFields).length) {
      return Response.json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Embroidery pricing input is invalid.",
          fields: structureFields,
        },
      }, { status: 400 });
    }

    const catalog = await catalogLoader();
    const structureInput = {
      lineItems: body.lineItems.map((item) => ({
        style: String(item.style).trim(),
        color: String(item.color).trim(),
        sizes: normalizeSizeMap(item.sizes),
      })),
    };
    const catalogFields = validateCatalogMatches(structureInput, catalog);
    if (Object.keys(catalogFields).length) {
      return Response.json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Embroidery pricing input is invalid.",
          fields: catalogFields,
        },
      }, { status: 400 });
    }

    const input = normalizeInput(body, catalog);
    const calc = calculateEmbroideryPricing(input, catalog);

    return Response.json({
      ok: true,
      product: "embroidery",
      price: {
        retail: calc.retail,
        each: calc.each,
      },
      currency: "USD",
      summary: buildSummary(input, calc),
      warnings: buildWarnings(body, input, calc),
    });
  } catch (error) {
    await logEmbroideryError(error, body);
    return internalErrorResponse(error);
  }
}
