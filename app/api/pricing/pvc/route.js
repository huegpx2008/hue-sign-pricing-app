import { createGeneralSignPricingPost, normalizeThicknessSidesType, pvcTypeName, toBoolean } from "../../../../lib/pricing/general-sign-api.js";
import { pvcOptions } from "../../../../data/productConfig.js";

const allowedThicknesses = new Set(["3", "6"]);

export const POST = createGeneralSignPricingPost({
  label: "PVC",
  responseProduct: "pvc",
  engineProduct: "pvc",
  normalizeInput(body, fields, common) {
    const typeInfo = normalizeThicknessSidesType(body, fields, {
      label: "PVC",
      options: pvcOptions,
      allowedThicknesses,
      normalizeThickness(value) {
        return value.replace(/mm$/, "");
      },
    });
    return {
      ...common,
      ...typeInfo,
      contourCut: toBoolean(body?.contourCut),
      rush: toBoolean(body?.rush),
      customCut: toBoolean(body?.customCut),
    };
  },
  toEngineInput(input) {
    return {
      pvcType: input.type,
      pvcContour: input.contourCut,
      pvcRush: input.rush,
      pvcCustomCut: input.customCut,
    };
  },
  toSummary(input, calc) {
    return {
      label: calc.label,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      thickness: `${input.thickness}mm`,
      sides: input.sides,
      type: input.type,
      typeName: pvcTypeName(input.type),
      options: {
        contourCut: input.contourCut,
        rush: input.rush,
        customCut: input.customCut,
      },
    };
  },
  toWarnings(input) {
    return input.customCut ? ["Custom cut is accepted for request compatibility but is not priced separately by the current PVC formula."] : [];
  },
});
