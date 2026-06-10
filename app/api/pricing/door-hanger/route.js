import {
  calculatePaperPricing,
  doorHangerBackPrintingOptions,
  doorHangerInkOptions,
  doorHangerPerforationOptions,
  doorHangerShrinkWrapOptions,
  doorHangerSizes,
  doorHangerTypes,
  errorResponse,
  invalidJsonResponse,
  required,
  safeResponse,
  validateOneOf,
  validatePositiveNumber,
} from "../../../../lib/pricing/paper-api.js";

function validate(body) {
  const fields = {};
  required(body, fields, ["size", "quantity", "type", "ink", "backPrinting", "perforation", "shrinkWrap"]);
  const quantity = validatePositiveNumber(body, fields, "quantity");

  validateOneOf(body, fields, "size", doorHangerSizes, "Must be 3.5 x 8.5, 4 x 11, 5.25 x 8.5, or 8.5 x 11");
  validateOneOf(body, fields, "type", doorHangerTypes, "Must be a supported door hanger type");
  validateOneOf(body, fields, "ink", doorHangerInkOptions, "Must be Standard Black or Full Color");
  validateOneOf(body, fields, "backPrinting", doorHangerBackPrintingOptions, "Must be No, Standard Black, or Full Color");
  validateOneOf(body, fields, "perforation", doorHangerPerforationOptions, "Must be No or Yes (1-4 Perforations)");
  validateOneOf(body, fields, "shrinkWrap", doorHangerShrinkWrapOptions, "Must be Shrink Wrap 250, 25s, 50s, or 100s");

  return {
    fields,
    input: {
      size: body?.size,
      quantity,
      type: body?.type,
      ink: body?.ink,
      backPrinting: body?.backPrinting,
      perforation: body?.perforation,
      shrinkWrap: body?.shrinkWrap,
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
  if (Object.keys(fields).length) return errorResponse("Door hanger", fields);

  const calc = calculatePaperPricing({
    product: "doorHangers",
    qty: input.quantity,
    options: {
      doorHangerSize: input.size,
      doorHangerQty: input.quantity,
      doorHangerType: input.type,
      doorHangerInk: input.ink,
      doorHangerBackPrinting: input.backPrinting,
      doorHangerPerforation: input.perforation,
      doorHangerShrinkWrap: input.shrinkWrap,
    },
  });

  return safeResponse("door-hanger", calc, {
    label: calc.label,
    quantity: input.quantity,
    size: input.size,
    type: input.type,
    ink: input.ink,
    backPrinting: input.backPrinting,
    perforation: input.perforation,
    shrinkWrap: input.shrinkWrap,
  }, [
    "Type is accepted for request compatibility but is not priced by the current door hanger formula.",
  ]);
}
