import { calculateGeneralSignPricing } from "../../../../lib/pricing/general-signs.js";

const requiredFields = ["width", "height", "quantity"];
const allowedStyles = new Set(["rectangle", "rounded-corners", "contour-cut"]);

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const toBoolean = (value) => value === true;
const normalizeKey = (value) => String(value || "").trim().toLowerCase();

function normalizeStyle(body) {
  if (body?.style !== undefined && body?.style !== null && body?.style !== "") {
    return normalizeKey(body.style);
  }

  if (body?.shape !== undefined && body?.shape !== null && body?.shape !== "") {
    return normalizeKey(body.shape);
  }

  if (toBoolean(body?.contourCut)) return "contour-cut";
  if (toBoolean(body?.roundedCorners)) return "rounded-corners";
  return "rectangle";
}

function validateVehicleMagnetInput(body) {
  const fields = {};

  for (const field of requiredFields) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
      fields[field] = "Required";
    }
  }

  const width = toPositiveNumber(body?.width);
  const height = toPositiveNumber(body?.height);
  const quantity = toPositiveNumber(body?.quantity);
  const style = normalizeStyle(body);

  if (body?.width !== undefined && width === null) fields.width = "Must be a positive number";
  if (body?.height !== undefined && height === null) fields.height = "Must be a positive number";
  if (body?.quantity !== undefined && quantity === null) fields.quantity = "Must be a positive number";
  if ((body?.style !== undefined || body?.shape !== undefined) && !allowedStyles.has(style)) {
    fields.style = "Must be rectangle, rounded-corners, or contour-cut";
  }

  return {
    fields,
    value: {
      width,
      height,
      quantity,
      style,
      rush: toBoolean(body?.rush),
    },
  };
}

function buildWarnings(input) {
  if (input.style !== "rounded-corners") return [];
  return ["Rounded corners are accepted for request compatibility but are not priced separately by the current vehicle magnet formula."];
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

  const validation = validateVehicleMagnetInput(body);
  if (Object.keys(validation.fields).length) {
    return Response.json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Vehicle magnet pricing input is invalid.",
        fields: validation.fields,
      },
    }, { status: 400 });
  }

  const input = validation.value;
  const calc = calculateGeneralSignPricing({
    product: "vehicleMagnets",
    activeProduct: "vehicleMagnets",
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
    vehicleMagnetMode: "custom",
    vehicleMagnetPreset: "18x12",
    vehicleMagnetContour: input.style === "contour-cut",
    vehicleMagnetRush: input.rush,
  });

  return Response.json({
    ok: true,
    product: "vehicle-magnet",
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
      style: input.style,
      options: {
        roundedCorners: input.style === "rounded-corners",
        contourCut: input.style === "contour-cut",
        rush: input.rush,
      },
    },
    warnings: buildWarnings(input),
  });
}
