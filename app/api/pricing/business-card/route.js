import {
  businessCardCoatings,
  businessCardQuantities,
  calculatePaperPricing,
  errorResponse,
  invalidJsonResponse,
  orientations,
  required,
  safeResponse,
  sides,
  toBoolean,
  validateOneOf,
  validatePositiveNumber,
} from "../../../../lib/pricing/paper-api.js";

function validate(body) {
  const fields = {};
  required(body, fields, ["quantity", "sides", "coating", "orientation"]);
  const quantity = validatePositiveNumber(body, fields, "quantity");
  const parsedQuantity = Number(body?.quantity);

  if (quantity !== null && !businessCardQuantities.has(parsedQuantity)) {
    fields.quantity = "Must be 250, 500, or 1000";
  }
  validateOneOf(body, fields, "sides", sides, "Must be single or double");
  validateOneOf(body, fields, "coating", businessCardCoatings, "Must be Gloss Laminate or No Coating");
  validateOneOf(body, fields, "orientation", orientations, "Must be Landscape or Portrait");

  return {
    fields,
    input: {
      quantity: parsedQuantity,
      sides: body?.sides,
      coating: body?.coating,
      orientation: body?.orientation,
      rush: toBoolean(body?.rush),
    },
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  const { fields, input } = validate(body);
  if (Object.keys(fields).length) return errorResponse("Business card", fields);

  const calc = calculatePaperPricing({
    product: "businessCards",
    qty: input.quantity,
    options: {
      businessCardQty: input.quantity,
      businessCardSides: input.sides,
      businessCardRush: input.rush,
    },
  });

  return safeResponse("business-card", calc, {
    label: calc.label,
    quantity: input.quantity,
    sides: input.sides,
    coating: input.coating,
    orientation: input.orientation,
    options: {
      rush: input.rush,
    },
  }, [
    "Coating is accepted for request compatibility but is not priced separately by the current business card formula.",
    "Orientation is accepted for request compatibility but is not priced by the current business card formula.",
  ]);
}
