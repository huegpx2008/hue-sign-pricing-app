import { calculateGeneralSignPricing } from "../../../../lib/pricing/general-signs.js";

const requiredFields = ["width", "height", "quantity", "thickness", "sides"];
const allowedThicknesses = new Set(["3mm", "6mm"]);
const allowedSides = new Set(["single", "double"]);

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const toBoolean = (value) => value === true;

function normalizeThickness(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSides(value) {
  return String(value || "").trim().toLowerCase();
}

function validateAcmInput(body) {
  const fields = {};

  for (const field of requiredFields) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
      fields[field] = "Required";
    }
  }

  const width = toPositiveNumber(body?.width);
  const height = toPositiveNumber(body?.height);
  const quantity = toPositiveNumber(body?.quantity);
  const thickness = normalizeThickness(body?.thickness);
  const sides = normalizeSides(body?.sides);

  if (body?.width !== undefined && width === null) fields.width = "Must be a positive number";
  if (body?.height !== undefined && height === null) fields.height = "Must be a positive number";
  if (body?.quantity !== undefined && quantity === null) fields.quantity = "Must be a positive number";
  if (body?.thickness !== undefined && !allowedThicknesses.has(thickness)) fields.thickness = "Must be 3mm or 6mm";
  if (body?.sides !== undefined && !allowedSides.has(sides)) fields.sides = "Must be single or double";

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
      rush: toBoolean(body?.rush),
    },
  };
}

function getAcmType(thickness, sides) {
  const thicknessKey = thickness === "6mm" ? "6" : "3";
  return `${thicknessKey}-${sides}`;
}

function buildWarnings(input) {
  const warnings = [];

  if (input.glossLaminate) {
    warnings.push("Gloss laminate is accepted for request compatibility but is not priced by the current ACM formula.");
  }

  if (input.rush) {
    warnings.push("Rush is accepted for request compatibility but is not priced by the current ACM formula.");
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

  const validation = validateAcmInput(body);
  if (Object.keys(validation.fields).length) {
    return Response.json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "ACM pricing input is invalid.",
        fields: validation.fields,
      },
    }, { status: 400 });
  }

  const input = validation.value;
  const calc = calculateGeneralSignPricing({
    product: "acm",
    activeProduct: "acm",
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
    acmType: getAcmType(input.thickness, input.sides),
    acmContour: input.contourCut,
    roundedCorners: false,
  });

  return Response.json({
    ok: true,
    product: "acm",
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
      options: {
        contourCut: input.contourCut,
        glossLaminate: input.glossLaminate,
        rush: input.rush,
      },
    },
    warnings: buildWarnings(input),
  });
}
