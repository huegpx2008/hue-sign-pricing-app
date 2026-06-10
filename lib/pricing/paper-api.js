import { calculateGeneralSignPricing } from "./general-signs.js";

export const businessCardQuantities = new Set([250, 500, 1000]);
export const sides = new Set(["single", "double"]);
export const businessCardCoatings = new Set(["Gloss Laminate", "No Coating"]);
export const orientations = new Set(["Landscape", "Portrait"]);

export const handheldPaperSizes = [
  { key: "3.5x2.5", label: "3.5\"x2.5\" Trading Card", perSheet: 56, w: 3.5, h: 2.5 },
  { key: "5x3", label: "5\"x3\"", perSheet: 30, w: 5, h: 3 },
  { key: "6x4", label: "6\"x4\"", perSheet: 21, w: 6, h: 4 },
  { key: "7x5", label: "7\"x5\"", perSheet: 12, w: 7, h: 5 },
  { key: "9x4", label: "9\"x4\"", perSheet: 14, w: 9, h: 4 },
  { key: "9x6", label: "9\"x6\"", perSheet: 9, w: 9, h: 6 },
  { key: "11x8.5", label: "11\"x8.5\"", perSheet: 5, w: 11, h: 8.5 },
  { key: "14x11", label: "14\"x11\"", perSheet: 2, w: 14, h: 11 },
  { key: "16x12", label: "16\"x12\"", perSheet: 2, w: 16, h: 12 },
  { key: "17x11", label: "17\"x11\"", perSheet: 2, w: 17, h: 11 },
  { key: "12x18", label: "12\"x18\"", perSheet: 2, w: 12, h: 18 },
  { key: "20x16", label: "20\"x16\"", perSheet: 1, w: 20, h: 16 },
  { key: "18x28", label: "18\"x28\"", perSheet: 1, w: 18, h: 28 },
];

export const carbonlessFormTypes = new Set(["2 Part", "3 Part", "4 Part"]);
export const carbonlessSizes = new Set(["8.5\" x 11\"", "5.5\" x 8.5\"", "8.5\" x 14\""]);
export const carbonlessQuantities = new Set([100, 250, 500, 1000, 2000, 2500, 5000, 7500, 10000]);
export const carbonlessPrintTypes = new Set(["Black Ink", "Full Color"]);
export const carbonlessPrintSides = new Set(["Front Only", "Front and Back"]);

export const doorHangerSizes = new Set(["3.5 x 8.5", "4 x 11", "5.25 x 8.5", "8.5 x 11"]);
export const doorHangerTypes = new Set([
  "White 80lb Cover Uncoated",
  "White 80lb Cover Gloss",
  "14pt Gloss Front - Uncoated Back",
  "14pt Gloss Front and Back",
  "14pt Uncoated Front and Back",
  "14pt Matte Front - Uncoated Back",
  "14pt Matte Front and Back",
  "16pt Matte Front - Uncoated Back",
  "16pt Matte Front and Back",
  "16pt Uncoated Front and Back",
  "16pt Gloss Front and Back",
  "16pt Gloss Front - Uncoated Back",
  "18pt Gloss Front - Uncoated Back",
  "18pt Matte Front - Uncoated Back",
  "65lb Shocking Pink Cover Uncoated",
  "65lb Yellow Light Cover Uncoated",
  "65lb Shocking Green Cover Uncoated",
  "65lb Blue Light Cover Uncoated",
  "65lb Orange Light Cover Uncoated",
]);
export const doorHangerInkOptions = new Set(["Standard Black", "Full Color"]);
export const doorHangerBackPrintingOptions = new Set(["No", "Standard Black", "Full Color"]);
export const doorHangerPerforationOptions = new Set(["No", "Yes (1 Perforation)", "Yes (2 Perforations)", "Yes (3 Perforations)", "Yes (4 Perforations)"]);
export const doorHangerShrinkWrapOptions = new Set(["Shrink Wrap 250", "Shrink Wrap 25s", "Shrink Wrap 50s", "Shrink Wrap 100s"]);

export const toBoolean = (value) => value === true;

export function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function required(body, fields, keys) {
  for (const key of keys) {
    if (body?.[key] === undefined || body?.[key] === null || body?.[key] === "") {
      fields[key] = "Required";
    }
  }
}

export function validatePositiveNumber(body, fields, key) {
  const value = toPositiveNumber(body?.[key]);
  if (body?.[key] !== undefined && body?.[key] !== null && body?.[key] !== "" && value === null) {
    fields[key] = "Must be a positive number";
  }
  return value;
}

export function validateOneOf(body, fields, key, allowed, message) {
  const value = body?.[key];
  if (value !== undefined && value !== null && value !== "" && !allowed.has(value)) {
    fields[key] = message;
  }
  return value;
}

export function errorResponse(label, fields) {
  return Response.json({
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message: `${label} pricing input is invalid.`,
      fields,
    },
  }, { status: 400 });
}

export function invalidJsonResponse() {
  return Response.json({
    ok: false,
    error: {
      code: "INVALID_JSON",
      message: "Request body must be valid JSON.",
    },
  }, { status: 400 });
}

export function safeResponse(product, calc, summary, warnings = []) {
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

export function calculatePaperPricing(input) {
  return calculateGeneralSignPricing({
    product: input.product,
    activeProduct: input.product,
    width: 0,
    height: 0,
    qty: input.qty,
    margin: 60,
    multiplier: 1,
    useDesignFee: false,
    useSetupFee: false,
    designFee: "",
    setupFee: "",
    delivery: "",
    productMap: {},
    ...input.options,
  });
}
