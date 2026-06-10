import {
  calculatePaperPricing,
  carbonlessFormTypes,
  carbonlessPrintSides,
  carbonlessPrintTypes,
  carbonlessQuantities,
  carbonlessSizes,
  errorResponse,
  invalidJsonResponse,
  required,
  safeResponse,
  toBoolean,
  validateOneOf,
  validatePositiveNumber,
} from "../../../../lib/pricing/paper-api.js";

function validate(body) {
  const fields = {};
  required(body, fields, ["formType", "size", "quantity", "printType", "printSides"]);
  const quantity = validatePositiveNumber(body, fields, "quantity");
  const parsedQuantity = Number(body?.quantity);

  if (quantity !== null && !carbonlessQuantities.has(parsedQuantity)) {
    fields.quantity = "Must be 100, 250, 500, 1000, 2000, 2500, 5000, 7500, or 10000";
  }
  validateOneOf(body, fields, "formType", carbonlessFormTypes, "Must be 2 Part, 3 Part, or 4 Part");
  validateOneOf(body, fields, "size", carbonlessSizes, "Must be 8.5\" x 11\", 5.5\" x 8.5\", or 8.5\" x 14\"");
  validateOneOf(body, fields, "printType", carbonlessPrintTypes, "Must be Black Ink or Full Color");
  validateOneOf(body, fields, "printSides", carbonlessPrintSides, "Must be Front Only or Front and Back");

  for (const key of ["numbering", "wraparound", "bookedSets", "rush"]) {
    if (body?.[key] !== undefined && typeof body[key] !== "boolean") fields[key] = "Must be a boolean";
  }

  return {
    fields,
    input: {
      formType: body?.formType,
      size: body?.size,
      quantity: parsedQuantity,
      printType: body?.printType,
      printSides: body?.printSides,
      numbering: toBoolean(body?.numbering),
      wraparound: toBoolean(body?.wraparound),
      bookedSets: toBoolean(body?.bookedSets),
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
  if (Object.keys(fields).length) return errorResponse("Carbonless", fields);

  const calc = calculatePaperPricing({
    product: "carbonless",
    qty: input.quantity,
    options: {
      carbonlessFormType: input.formType,
      carbonlessSize: input.size,
      carbonlessQty: input.quantity,
      carbonlessPrintType: input.printType,
      carbonlessPrintSides: input.printSides,
      carbonlessNumbering: input.numbering,
      carbonlessWraparound: input.wraparound,
      carbonlessBookedSets: input.bookedSets,
      carbonlessRush: input.rush,
    },
  });

  return safeResponse("carbonless", calc, {
    label: calc.label,
    quantity: input.quantity,
    formType: input.formType,
    size: input.size,
    printType: input.printType,
    printSides: input.printSides,
    options: {
      numbering: input.numbering,
      wraparound: input.wraparound,
      bookedSets: input.bookedSets,
      rush: input.rush,
    },
  });
}
