import { createGeneralSignPricingPost, normalizeSides, toBoolean } from "../../../../lib/pricing/general-sign-api.js";

export const POST = createGeneralSignPricingPost({
  label: "Polystyrene",
  responseProduct: "polystyrene",
  engineProduct: "polystyrene",
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
      polystyreneDouble: input.sides === "double",
      polystyreneContour: input.contourCut,
      polystyreneGloss: input.glossLaminate,
      polystyreneRush: input.rush,
      polystyreneCustomCut: input.customCut,
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
    return input.customCut ? ["Custom cut is accepted for request compatibility but is not priced separately by the current polystyrene formula."] : [];
  },
});
