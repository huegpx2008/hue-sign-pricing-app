import { createGeneralSignPricingPost, normalizeAcrylicStandOffs, toBoolean } from "../../../../lib/pricing/general-sign-api.js";
import { acrylicStandOffOptions } from "../../../../data/productConfig.js";

export const POST = createGeneralSignPricingPost({
  label: "Acrylic",
  responseProduct: "acrylic",
  engineProduct: "acrylic",
  normalizeInput(body, fields, common) {
    return {
      ...common,
      contourCut: toBoolean(body?.contourCut),
      roundedCorners: toBoolean(body?.roundedCorners),
      rush: toBoolean(body?.rush),
      ...normalizeAcrylicStandOffs(body, fields),
    };
  },
  toEngineInput(input) {
    return {
      acrylicContour: input.contourCut,
      acrylicRoundedCorners: input.roundedCorners,
      acrylicStandOffs: input.standOffs,
      acrylicStandOffQty: input.standOffQty,
      acrylicStandOffColor: input.standOffColor,
    };
  },
  toSummary(input, calc) {
    return {
      label: calc.label,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      options: {
        contourCut: input.contourCut,
        roundedCorners: input.roundedCorners,
        standOffs: input.standOffs,
        standOffQty: input.standOffs ? input.standOffQty : 0,
        standOffColor: input.standOffs ? input.standOffColor : null,
        standOffColorName: input.standOffs ? acrylicStandOffOptions[input.standOffColor].name : null,
        rush: input.rush,
      },
    };
  },
  toWarnings(input) {
    return input.rush ? ["Rush is accepted for request compatibility but is not priced by the current acrylic formula."] : [];
  },
});
