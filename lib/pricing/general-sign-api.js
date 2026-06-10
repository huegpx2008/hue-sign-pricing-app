import { acrylicStandOffOptions, aluminumOptions, pvcOptions } from "../../data/productConfig.js";
import { calculateGeneralSignPricing } from "./general-signs.js";

export const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

export const toBoolean = (value) => value === true;
export const normalizeKey = (value) => String(value || "").trim().toLowerCase();

export function validateCommonDimensions(body, fields) {
  const missing = new Set();
  for (const field of ["width", "height", "quantity"]) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
      fields[field] = "Required";
      missing.add(field);
    }
  }

  const width = toPositiveNumber(body?.width);
  const height = toPositiveNumber(body?.height);
  const quantity = toPositiveNumber(body?.quantity);

  if (!missing.has("width") && body?.width !== undefined && width === null) fields.width = "Must be a positive number";
  if (!missing.has("height") && body?.height !== undefined && height === null) fields.height = "Must be a positive number";
  if (!missing.has("quantity") && body?.quantity !== undefined && quantity === null) fields.quantity = "Must be a positive number";

  return { width, height, quantity };
}

export function normalizeSides(value, fields, options = {}) {
  const sides = value === undefined || value === null || value === ""
    ? options.defaultValue
    : normalizeKey(value);

  if (!sides && options.required) {
    fields.sides = "Required";
    return sides;
  }

  if (sides && !new Set(["single", "double"]).has(sides)) {
    fields.sides = "Must be single or double";
  }

  return sides;
}

export function normalizeThicknessSidesType(body, fields, config) {
  const rawType = body?.type ?? body?.material;
  const type = rawType === undefined || rawType === null || rawType === "" ? "" : normalizeKey(rawType);
  const allowedTypes = new Set(Object.keys(config.options));

  if (type) {
    if (!allowedTypes.has(type)) fields.type = `Must be one of ${Object.keys(config.options).join(", ")}`;
    const [thickness, sides] = type.split("-");
    return { type, thickness, sides };
  }

  const rawThickness = body?.thickness;
  const thickness = rawThickness === undefined || rawThickness === null || rawThickness === ""
    ? ""
    : normalizeKey(String(rawThickness).replace(/^\./, ""));
  const normalizedThickness = config.normalizeThickness ? config.normalizeThickness(thickness) : thickness;
  const sides = normalizeSides(body?.sides, fields, { required: true });

  if (!normalizedThickness) fields.thickness = "Required";
  if (normalizedThickness && !config.allowedThicknesses.has(normalizedThickness)) {
    fields.thickness = `Must be ${[...config.allowedThicknesses].join(" or ")}`;
  }

  const derivedType = normalizedThickness && sides ? `${normalizedThickness}-${sides}` : "";
  if (derivedType && !allowedTypes.has(derivedType)) fields.type = `Unsupported ${config.label} type`;

  return { type: derivedType, thickness: normalizedThickness, sides };
}

function baseEngineInput(product, input) {
  return {
    product,
    activeProduct: product,
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
  };
}

export function customerSafeResponse(product, input, calc, summary, warnings) {
  return Response.json({
    ok: true,
    product,
    price: {
      retail: calc.retail,
      each: calc.each,
    },
    currency: "USD",
    summary,
    warnings,
  });
}

export function createGeneralSignPricingPost(config) {
  return async function POST(request) {
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

    const fields = {};
    const common = validateCommonDimensions(body, fields);
    const input = config.normalizeInput(body, fields, common);

    if (Object.keys(fields).length) {
      return Response.json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `${config.label} pricing input is invalid.`,
          fields,
        },
      }, { status: 400 });
    }

    const engineInput = {
      ...baseEngineInput(config.engineProduct, input),
      ...config.toEngineInput(input),
    };
    const calc = calculateGeneralSignPricing(engineInput);

    return customerSafeResponse(
      config.responseProduct,
      input,
      calc,
      config.toSummary(input, calc),
      config.toWarnings(input),
    );
  };
}

export function normalizeAcrylicStandOffs(body, fields) {
  const standOffs = toBoolean(body?.standOffs) || toBoolean(body?.standoffs);
  const standOffQty = body?.standOffQty === undefined || body?.standOffQty === null || body?.standOffQty === ""
    ? 4
    : Number(body.standOffQty);
  const standOffColor = body?.standOffColor === undefined || body?.standOffColor === null || body?.standOffColor === ""
    ? "silver"
    : normalizeKey(body.standOffColor);

  if (!Number.isFinite(standOffQty) || standOffQty < 0) fields.standOffQty = "Must be a non-negative number";
  if (!acrylicStandOffOptions[standOffColor]) fields.standOffColor = "Must be silver or black";

  return { standOffs, standOffQty, standOffColor };
}

export function aluminumTypeName(type) {
  return aluminumOptions[type]?.name || type;
}

export function pvcTypeName(type) {
  return pvcOptions[type]?.name || type;
}
