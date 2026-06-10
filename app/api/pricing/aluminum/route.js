import { aluminumOptions } from "../../../../data/productConfig.js";
import { aluminumTypeName, createGeneralSignPricingPost, normalizeThicknessSidesType, toBoolean } from "../../../../lib/pricing/general-sign-api.js";

const allowedThicknesses = new Set(["040", "080"]);

export const POST = createGeneralSignPricingPost({
  label: "Aluminum",
  responseProduct: "aluminum",
  engineProduct: "aluminum",
  normalizeInput(body, fields, common) {
    const typeInfo = normalizeThicknessSidesType(body, fields, {
      label: "Aluminum",
      options: aluminumOptions,
      allowedThicknesses,
      normalizeThickness(value) {
        return value.replace(/^0?\./, "").replace(/mm$/, "");
      },
    });
    return {
      ...common,
      ...typeInfo,
      contourCut: toBoolean(body?.contourCut),
      roundedCorners: toBoolean(body?.roundedCorners),
      rush: toBoolean(body?.rush),
    };
  },
  toEngineInput(input) {
    return {
      aluminumType: input.type,
      acmContour: input.contourCut,
      roundedCorners: input.roundedCorners,
    };
  },
  toSummary(input, calc) {
    return {
      label: calc.label,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      thickness: `.${input.thickness}`,
      sides: input.sides,
      type: input.type,
      typeName: aluminumTypeName(input.type),
      options: {
        contourCut: input.contourCut,
        roundedCorners: input.roundedCorners,
        rush: input.rush,
      },
    };
  },
  toWarnings(input) {
    return input.rush ? ["Rush is accepted for request compatibility but is not priced by the current aluminum formula."] : [];
  },
});
