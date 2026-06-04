import { calculateGeneralSignPricing } from "../../../../lib/pricing/general-signs.js";

const requiredFields = ["width", "height", "quantity", "thickness", "sides"];
const allowedThicknesses = new Set(["4mm", "10mm"]);
const allowedSides = new Set(["single", "double"]);
const allowedStakeTypes = new Set(["none", "standard", "heavy-duty"]);
const allowedFluteDirections = new Set(["vertical", "horizontal", "best"]);

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const toBoolean = (value) => value === true;
const normalizeKey = (value) => String(value || "").trim().toLowerCase();

function validateCustomCutCoroplastInput(body) {
  const fields = {};

  for (const field of requiredFields) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
      fields[field] = "Required";
    }
  }

  const width = toPositiveNumber(body?.width);
  const height = toPositiveNumber(body?.height);
  const quantity = toPositiveNumber(body?.quantity);
  const thickness = normalizeKey(body?.thickness);
  const sides = normalizeKey(body?.sides);
  const stakeType = body?.stakeType === undefined || body?.stakeType === null || body?.stakeType === ""
    ? "none"
    : normalizeKey(body.stakeType);
  const fluteDirection = body?.fluteDirection === undefined || body?.fluteDirection === null || body?.fluteDirection === ""
    ? "best"
    : normalizeKey(body.fluteDirection);

  if (body?.width !== undefined && width === null) fields.width = "Must be a positive number";
  if (body?.height !== undefined && height === null) fields.height = "Must be a positive number";
  if (body?.quantity !== undefined && quantity === null) fields.quantity = "Must be a positive number";
  if (body?.thickness !== undefined && !allowedThicknesses.has(thickness)) fields.thickness = "Must be 4mm or 10mm";
  if (body?.sides !== undefined && !allowedSides.has(sides)) fields.sides = "Must be single or double";
  if (body?.stakeType !== undefined && !allowedStakeTypes.has(stakeType)) fields.stakeType = "Must be none, standard, or heavy-duty";
  if (body?.fluteDirection !== undefined && !allowedFluteDirections.has(fluteDirection)) fields.fluteDirection = "Must be vertical, horizontal, or best";

  return {
    fields,
    value: {
      width,
      height,
      quantity,
      thickness,
      sides,
      contourCut: toBoolean(body?.contourCut),
      glossLaminate: toBoolean(body?.glossLaminate),
      grommets: toBoolean(body?.grommets),
      stakeType,
      rush: toBoolean(body?.rush),
      fluteDirection,
    },
  };
}

function buildWarnings(input) {
  const warnings = [];

  if (input.thickness === "10mm") {
    warnings.push("10mm thickness is accepted for request compatibility but is not priced separately by the current custom-cut Coroplast formula.");
  }

  if (input.glossLaminate) {
    warnings.push("Gloss laminate uses the existing Coroplast gloss finish pricing behavior.");
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

  const validation = validateCustomCutCoroplastInput(body);
  if (Object.keys(validation.fields).length) {
    return Response.json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Custom-cut Coroplast pricing input is invalid.",
        fields: validation.fields,
      },
    }, { status: 400 });
  }

  const input = validation.value;
  const calc = calculateGeneralSignPricing({
    product: "coroSigns",
    activeProduct: "coro",
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
    coroDouble: input.sides === "double",
    coroFlute: input.fluteDirection,
    stakes: input.stakeType === "standard",
    heavyStakes: input.stakeType === "heavy-duty",
    grommets: input.grommets,
    gloss: input.glossLaminate,
    coroContour: input.contourCut,
    coroRush: input.rush,
  });

  return Response.json({
    ok: true,
    product: "custom-cut-coroplast",
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
      thickness: input.thickness,
      sides: input.sides,
      fluteDirection: input.fluteDirection,
      options: {
        contourCut: input.contourCut,
        glossLaminate: input.glossLaminate,
        grommets: input.grommets,
        stakeType: input.stakeType,
        rush: input.rush,
      },
    },
    warnings: buildWarnings(input),
  });
}
