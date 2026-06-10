import { createGeneralSignPricingPost, normalizeSides, toBoolean } from "../../../../lib/pricing/general-sign-api.js";

export const POST = createGeneralSignPricingPost({
  label: "Foamcore",
  responseProduct: "foamcore",
  engineProduct: "foamcore",
  normalizeInput(body, fields, common) {
    return {
      ...common,
      sides: normalizeSides(body?.sides, fields, { required: true }),
      contourCut: toBoolean(body?.contourCut),
      glossLaminate: toBoolean(body?.glossLaminate),
      rush: toBoolean(body?.rush),
      customCut: toBoolean(body?.customCut),
    };
  },
  toEngineInput(input) {
    return {
      foamcoreDouble: input.sides === "double",
      foamcoreContour: input.contourCut,
      foamcoreGloss: input.glossLaminate,
      foamcoreRush: input.rush,
      foamcoreCustomCut: input.customCut,
    };
  },
  toSummary(input, calc) {
    return {
      label: calc.label,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      sides: input.sides,
      options: {
        contourCut: input.contourCut,
        glossLaminate: input.glossLaminate,
        rush: input.rush,
        customCut: input.customCut,
      },
    };
  },
  toWarnings(input) {
    return input.customCut ? ["Custom cut is accepted for request compatibility but is not priced separately by the current foamcore formula."] : [];
  },
});
