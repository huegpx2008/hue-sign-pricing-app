import { findStyle, findVariantSize, loadApparelCatalog } from "../../../../lib/catalog/apparel-catalog.js";
import { calculateScreenprintPricing } from "../../../../lib/pricing/screenprint.js";

const allowedSizes = new Set(["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"]);

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const toBoolean = (value) => value === true;

function validateStructure(body) {
  const fields = {};

  if (!Array.isArray(body?.lineItems) || body.lineItems.length === 0) {
    fields.lineItems = "At least one garment line item is required";
  }

  if (body?.locations !== undefined && (!Array.isArray(body.locations) || body.locations.length === 0)) {
    fields.locations = "Must be a non-empty array when provided";
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
      const normalizedSize = String(size || "").trim().toUpperCase();
      const parsedQuantity = Number(quantity);
      if (!allowedSizes.has(normalizedSize)) fields[`${prefix}.sizes.${size}`] = "Unsupported size";
      if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) fields[`${prefix}.sizes.${size}`] = "Must be a non-negative number";
      if (parsedQuantity > 0) positiveSizeCount += 1;
    }

    if (positiveSizeCount === 0) fields[`${prefix}.sizes`] = "At least one size quantity must be greater than zero";
  });

  const locations = Array.isArray(body?.locations) && body.locations.length ? body.locations : [{ name: "Front", colors: 1 }];
  locations.forEach((location, index) => {
    const colors = toPositiveNumber(location?.colors);
    if (!location?.name) fields[`locations.${index}.name`] = "Required";
    if (colors === null) fields[`locations.${index}.colors`] = "Must be a positive number";
    if (colors !== null && (colors < 1 || colors > 4 || !Number.isInteger(colors))) {
      fields[`locations.${index}.colors`] = "Must be an integer from 1 to 4";
    }
  });

  return fields;
}

function normalizeInput(body) {
  return {
    lineItems: body.lineItems.map((item) => ({
      style: String(item.style).trim(),
      color: String(item.color).trim(),
      sizes: Object.fromEntries(Object.entries(item.sizes).map(([size, quantity]) => [
        String(size).trim().toUpperCase(),
        Number(quantity),
      ])),
    })),
    locations: (Array.isArray(body.locations) && body.locations.length ? body.locations : [{ name: "Front", colors: 1 }]).map((location) => ({
      name: String(location.name).trim(),
      colors: Number(location.colors),
    })),
    sameDesign: body.sameDesign !== false,
    darkGarments: toBoolean(body.darkGarments),
    whiteUnderbase: toBoolean(body.whiteUnderbase),
    setupFeeEnabled: body.setupFeeEnabled !== false,
  };
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

function buildWarnings(input, calc) {
  const warnings = [];
  if (calc.totalGarments > 0 && calc.totalGarments < 24) {
    warnings.push("Screen printing usually starts at 24 pieces.");
  }

  const colors = new Set(input.lineItems.map((item) => item.color).filter(Boolean));
  if (colors.size > 1) {
    warnings.push("Mixed garment colors are present; artwork and ink setup may require review.");
  }

  if (input.darkGarments || input.whiteUnderbase) {
    warnings.push("Dark garments or white underbase requests may affect final setup and require review.");
  }

  if (!input.sameDesign && input.lineItems.length > 1) {
    warnings.push("Separate designs are priced as separate screen print groups.");
  }

  return warnings;
}

export async function POST(request) {
  let body;

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
        message: "Screen print pricing input is invalid.",
        fields: structureFields,
      },
    }, { status: 400 });
  }

  const input = normalizeInput(body);
  const catalog = await loadApparelCatalog();
  const catalogFields = validateCatalogMatches(input, catalog);
  if (Object.keys(catalogFields).length) {
    return Response.json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Screen print pricing input is invalid.",
        fields: catalogFields,
      },
    }, { status: 400 });
  }

  const calc = calculateScreenprintPricing(input, catalog);

  return Response.json({
    ok: true,
    product: "screenprint",
    price: {
      retail: calc.retail,
      each: calc.each,
    },
    currency: "USD",
    summary: {
      label: "Screen Printing",
      totalQuantity: calc.totalGarments,
      sameDesign: input.sameDesign,
      setupFeeEnabled: input.setupFeeEnabled,
      lineItems: calc.lineItems.map((item) => ({
        style: item.style,
        productName: item.title,
        color: item.color,
        quantity: item.totalQty,
        sizes: Object.fromEntries(Object.entries(item.sizes || {}).filter(([, quantity]) => Number(quantity) > 0)),
      })),
      locations: input.locations,
      options: {
        darkGarments: input.darkGarments,
        whiteUnderbase: input.whiteUnderbase,
      },
    },
    warnings: buildWarnings(input, calc),
  });
}
