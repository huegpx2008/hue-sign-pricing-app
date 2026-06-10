import { createGeneralSignPricingPost, toBoolean } from "../../../../lib/pricing/general-sign-api.js";

export const POST = createGeneralSignPricingPost({
  label: "Mesh banner",
  responseProduct: "mesh-banner",
  engineProduct: "meshBanner",
  normalizeInput(body, fields, common) {
    return {
      ...common,
      polePocket: toBoolean(body?.polePocket),
      rope: toBoolean(body?.rope),
      webbing: toBoolean(body?.webbing),
      grommets: toBoolean(body?.grommets),
      welding: toBoolean(body?.welding),
      rush: toBoolean(body?.rush),
    };
  },
  toEngineInput(input) {
    return {
      meshPolePocket: input.polePocket,
      meshGrommets: input.grommets,
      meshWelding: input.welding,
      meshRope: input.rope,
      meshWebbing: input.webbing,
      meshRush: input.rush,
    };
  },
  toSummary(input, calc) {
    return {
      label: calc.label,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      options: {
        polePocket: input.polePocket,
        rope: input.rope,
        webbing: input.webbing,
        grommets: input.grommets,
        welding: input.welding,
        rush: input.rush,
      },
    };
  },
  toWarnings(input) {
    const warnings = [];
    if (input.grommets) warnings.push("Grommets are accepted for request compatibility but are not priced separately by the current mesh banner formula.");
    if (input.welding) warnings.push("Welding is accepted for request compatibility but is not priced separately by the current mesh banner formula.");
    return warnings;
  },
});
