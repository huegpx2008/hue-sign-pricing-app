import { bannerOptions } from "../../../../data/productConfig.js";
import { calculateGeneralSignPricing } from "../../../../lib/pricing/general-signs.js";

const requiredFields = ["width", "height", "quantity", "material"];

const toPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const toBoolean = (value) => value === true;

function validateBannerInput(body) {
  const fields = {};

  for (const field of requiredFields) {
    if (body?.[field] === undefined || body?.[field] === null || body?.[field] === "") {
      fields[field] = "Required";
    }
  }

  const width = toPositiveNumber(body?.width);
  const height = toPositiveNumber(body?.height);
  const quantity = toPositiveNumber(body?.quantity);

  if (body?.width !== undefined && width === null) fields.width = "Must be a positive number";
  if (body?.height !== undefined && height === null) fields.height = "Must be a positive number";
  if (body?.quantity !== undefined && quantity === null) fields.quantity = "Must be a positive number";
  if (body?.material !== undefined && !bannerOptions[body.material]) fields.material = "Unknown banner material";

  return {
    fields,
    value: {
      width,
      height,
      quantity,
      material: body?.material,
      polePocket: toBoolean(body?.polePocket),
      rope: toBoolean(body?.rope),
      windSlits: toBoolean(body?.windSlits),
      rush: toBoolean(body?.rush),
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

  const validation = validateBannerInput(body);
  if (Object.keys(validation.fields).length) {
    return Response.json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Banner pricing input is invalid.",
        fields: validation.fields,
      },
    }, { status: 400 });
  }

  const input = validation.value;
  const material = bannerOptions[input.material];
  const calc = calculateGeneralSignPricing({
    product: "banner",
    activeProduct: "banner",
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
    bannerType: input.material,
    polePocket: input.polePocket,
    rope: input.rope,
    windSlits: input.windSlits,
    bannerRush: input.rush,
  });

  return Response.json({
    ok: true,
    product: "banner",
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
      material: input.material,
      materialName: material.name,
      options: {
        polePocket: input.polePocket,
        rope: input.rope,
        windSlits: input.windSlits,
        rush: input.rush,
      },
    },
    warnings: [],
  });
}
