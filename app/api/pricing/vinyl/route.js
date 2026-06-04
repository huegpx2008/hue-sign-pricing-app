import { vinylOptions } from "../../../../data/productConfig.js";
import { calculateGeneralSignPricing } from "../../../../lib/pricing/general-signs.js";

const requiredFields = ["width", "height", "quantity"];
const materialMap = {
  standard: { product: "vinyl", vinylType: "gf-standard", material: "standard", materialName: vinylOptions["gf-standard"].name },
  "standard-vinyl": { product: "vinyl", vinylType: "gf-standard", material: "standard", materialName: vinylOptions["gf-standard"].name },
  reflective: { product: "reflective", vinylType: "gf-standard", material: "reflective", materialName: "Oralite 5600 Reflective Film" },
  "reflective-vinyl": { product: "reflective", vinylType: "gf-standard", material: "reflective", materialName: "Oralite 5600 Reflective Film" },
  "low-tack-wall": { product: "vinyl", vinylType: "low-tac-wall", material: "low-tack-wall", materialName: vinylOptions["low-tac-wall"].name },
  "low-tack-wall-vinyl": { product: "vinyl", vinylType: "low-tac-wall", material: "low-tack-wall", materialName: vinylOptions["low-tac-wall"].name },
  "premium-vehicle": { product: "vinyl", vinylType: "3m-controltac", material: "premium-vehicle", materialName: vinylOptions["3m-controltac"].name },
  "premium-vehicle-vinyl": { product: "vinyl", vinylType: "3m-controltac", material: "premium-vehicle", materialName: vinylOptions["3m-controltac"].name },
};
const laminateMap = {
  none: "No Laminate",
  "no-laminate": "No Laminate",
  gloss: "Gloss Laminate",
  "gloss-laminate": "Gloss Laminate",
  matte: "Matte Laminate",
  "matte-laminate": "Matte Laminate",
};

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const toBoolean = (value) => value === true;
const normalizeKey = (value) => String(value || "").trim().toLowerCase();

function validateVinylInput(body) {
  const fields = {};

  for (const field of requiredFields) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
      fields[field] = "Required";
    }
  }

  const rawMaterial = body?.material ?? body?.type;
  if (rawMaterial === undefined || rawMaterial === null || rawMaterial === "") {
    fields.material = "Required";
  }

  const width = toPositiveNumber(body?.width);
  const height = toPositiveNumber(body?.height);
  const quantity = toPositiveNumber(body?.quantity);
  const materialKey = normalizeKey(rawMaterial);
  const laminateKey = body?.laminate === undefined || body?.laminate === null || body?.laminate === ""
    ? "gloss"
    : normalizeKey(body.laminate);

  if (body?.width !== undefined && width === null) fields.width = "Must be a positive number";
  if (body?.height !== undefined && height === null) fields.height = "Must be a positive number";
  if (body?.quantity !== undefined && quantity === null) fields.quantity = "Must be a positive number";
  if (rawMaterial !== undefined && !materialMap[materialKey]) fields.material = "Must be standard, reflective, low-tack-wall, or premium-vehicle";
  if (body?.laminate !== undefined && !laminateMap[laminateKey]) fields.laminate = "Must be none, gloss, or matte";

  return {
    fields,
    value: {
      width,
      height,
      quantity,
      material: materialMap[materialKey],
      laminateKey,
      laminate: laminateMap[laminateKey],
      contourCut: toBoolean(body?.contourCut),
      rush: toBoolean(body?.rush),
      gangLayout: toBoolean(body?.gangLayout) || toBoolean(body?.optimizeLayout),
    },
  };
}

function buildWarnings(body, input) {
  const warnings = [];

  if (body?.laminate !== undefined) {
    warnings.push("Laminate is accepted for request compatibility but is not priced separately by the current vinyl formula.");
  }

  if (input.gangLayout && !input.contourCut) {
    warnings.push("Gang layout is applied using the current vinyl layout formula. Contour padding and waste only affect pricing when contourCut is true.");
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

  const validation = validateVinylInput(body);
  if (Object.keys(validation.fields).length) {
    return Response.json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Vinyl pricing input is invalid.",
        fields: validation.fields,
      },
    }, { status: 400 });
  }

  const input = validation.value;
  const calc = calculateGeneralSignPricing({
    product: input.material.product,
    activeProduct: input.material.product,
    width: input.width,
    height: input.height,
    qty: input.quantity,
    margin: 60,
    multiplier: 1,
    useDesignFee: false,
    useSetupFee: false,
    designFee: "",
    setupFee: "",
    delivery: "",
    productMap: {},
    vinylType: input.material.vinylType,
    vinylLaminate: input.laminate,
    vinylContour: input.contourCut,
    vinylRush: input.rush,
    gangVinyl: input.gangLayout,
    contourPadding: 0.5,
    gangWastePercent: 15,
  });

  return Response.json({
    ok: true,
    product: "vinyl",
    price: {
      retail: calc.retail,
      each: calc.each,
    },
    currency: "USD",
    summary: {
      label: calc.label,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      material: input.material.material,
      materialName: input.material.materialName,
      laminate: input.laminateKey,
      laminateName: input.laminate,
      options: {
        contourCut: input.contourCut,
        rush: input.rush,
        gangLayout: input.gangLayout,
      },
    },
    warnings: buildWarnings(body, input),
  });
}
