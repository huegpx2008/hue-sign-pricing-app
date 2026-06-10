import { createGeneralSignPricingPost, toBoolean } from "../../../../lib/pricing/general-sign-api.js";

export const POST = createGeneralSignPricingPost({
  label: "Poster",
  responseProduct: "poster",
  engineProduct: "poster",
  normalizeInput(body, fields, common) {
    return {
      ...common,
      rush: toBoolean(body?.rush),
    };
  },
  toEngineInput(input) {
    return {
      posterRush: input.rush,
    };
  },
  toSummary(input, calc) {
    return {
      label: calc.label,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      options: {
        rush: input.rush,
      },
    };
  },
  toWarnings() {
    return [];
  },
});
