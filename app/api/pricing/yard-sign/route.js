import { calculateGeneralSignPricing } from "../../../../lib/pricing/general-signs.js";
import { internalSignCost } from "../../../../lib/pricing/internal-api.js";

const requiredFields = ["quantity", "sides", "stakeType"];
const allowedSides = new Set(["single", "double"]);
const allowedStakeTypes = new Set(["none", "standard", "heavy-duty"]);

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

function validateYardSignInput(body) {
  const fields = {};

  for (const field of requiredFields) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
      fields[field] = "Required";
    }
  }

  const quantity = toPositiveNumber(body?.quantity);
  const sides = String(body?.sides || "").trim().toLowerCase();
  const stakeType = String(body?.stakeType || "").trim().toLowerCase();

  if (body?.quantity !== undefined && quantity === null) fields.quantity = "Must be a positive number";
  if (body?.sides !== undefined && !allowedSides.has(sides)) fields.sides = "Must be single or double";
  if (body?.stakeType !== undefined && !allowedStakeTypes.has(stakeType)) fields.stakeType = "Must be none, standard, or heavy-duty";

  return {
    fields,
    value: {
      quantity,
      sides,
      stakeType,
    },
  };
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

  const validation = validateYardSignInput(body);
  if (Object.keys(validation.fields).length) {
    return Response.json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Yard sign pricing input is invalid.",
        fields: validation.fields,
      },
    }, { status: 400 });
  }

  const input = validation.value;
  const calc = calculateGeneralSignPricing({
    product: "coro",
    activeProduct: "coro",
    width: 24,
    height: 18,
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
    coroFlute: "vertical",
    stakes: input.stakeType === "standard",
    heavyStakes: input.stakeType === "heavy-duty",
    grommets: false,
    gloss: false,
    coroContour: false,
    coroRush: false,
  });
  const internalCost = internalSignCost(request, calc);

  return Response.json({
    ok: true,
    product: "yard-sign",
    price: {
      retail: calc.retail,
      each: calc.each,
    },
    currency: "USD",
    summary: {
      label: calc.label,
      size: "18 x 24",
      width: 24,
      height: 18,
      quantity: input.quantity,
      sides: input.sides,
      stakeType: input.stakeType,
    },
    warnings: [],
    ...(internalCost ? { internalCost } : {}),
  });
}
