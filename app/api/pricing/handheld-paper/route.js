import {
  businessCardCoatings,
  calculatePaperPricing,
  errorResponse,
  handheldPaperSizes,
  invalidJsonResponse,
  orientations,
  required,
  safeResponse,
  sides,
  toBoolean,
  validateOneOf,
  validatePositiveNumber,
} from "../../../../lib/pricing/paper-api.js";

const sizesByKey = new Map(handheldPaperSizes.map((size) => [size.key, size]));
const sizeLabels = new Set(handheldPaperSizes.map((size) => size.label));

function resolveSize(value) {
  if (sizesByKey.has(value)) return sizesByKey.get(value);
  return handheldPaperSizes.find((size) => size.label === value) || null;
}

function validate(body) {
  const fields = {};
  required(body, fields, ["quantity", "size", "sides", "coating", "orientation"]);
  const quantity = validatePositiveNumber(body, fields, "quantity");
  const size = resolveSize(body?.size);

  if (body?.size !== undefined && body?.size !== null && body?.size !== "" && !size) {
    fields.size = `Must be one of ${[...sizesByKey.keys(), ...sizeLabels].join(", ")}`;
  }
  validateOneOf(body, fields, "sides", sides, "Must be single or double");
  validateOneOf(body, fields, "coating", businessCardCoatings, "Must be Gloss Laminate or No Coating");
  validateOneOf(body, fields, "orientation", orientations, "Must be Landscape or Portrait");

  return {
    fields,
    input: {
      quantity,
      size,
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
  if (Object.keys(fields).length) return errorResponse("Handheld paper", fields);

  const calc = calculatePaperPricing({
    product: "handheld16ptPaper",
    qty: input.quantity,
    options: {
      handheldPaperSize: input.size,
      handheldPaperSides: input.sides,
      handheldPaperRush: input.rush,
    },
  });

  return safeResponse("handheld-paper", calc, {
    label: calc.label,
    quantity: input.quantity,
    size: input.size.key,
    sizeLabel: input.size.label,
    sides: input.sides,
    coating: input.coating,
    orientation: input.orientation,
    options: {
      rush: input.rush,
    },
  }, [
    "Sides are accepted for request compatibility but are not priced separately by the current handheld paper formula.",
    "Coating is accepted for request compatibility but is not priced separately by the current handheld paper formula.",
    "Orientation is accepted for request compatibility but is not priced by the current handheld paper formula.",
  ]);
}
