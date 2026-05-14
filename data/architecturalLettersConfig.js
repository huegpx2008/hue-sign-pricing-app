export const architecturalLetterSteps = [
  { id: "productType", title: "Product Type" },
  { id: "material", title: "Material" },
  { id: "finish", title: "Finish" },
  { id: "thickness", title: "Thickness / Return Depth" },
  { id: "mounting", title: "Mounting" },
  { id: "lighting", title: "Lighting" },
  { id: "letterHeight", title: "Letter Height" },
  { id: "characterCount", title: "Character Count / Text" },
  { id: "freight", title: "Freight" },
  { id: "summary", title: "Quote Summary" },
];

export const architecturalLetterCatalog = {
  productTypes: ["Flat Cut Metal", "Fabricated Non-Lit", "Flat Cut Acrylic", "Formed Plastic", "Cast Metal", "Face Lit", "Halo Lit", "Plaques"],
  materials: ["Aluminum", "Stainless Steel", "Brass", "Bronze", "Acrylic", "PVC"],
  lighting: ["Non-Lit", "Face-Lit", "Halo-Lit", "Face + Halo-Lit"],
  mounting: ["Stud Mount", "Raceway", "Pad Mount", "Flush Mount", "Double-Face Tape"],
  finishes: ["Raw", "Brushed", "Polished", "Painted", "Anodized", "Patina"],
  thickness: ['1/8"', '1/4"', '3/8"', '1/2"', '3/4"', '1"'],
  returnDepth: ['1/2"', '1"', '1.5"', '2"', 'Custom'],
  shippingMethods: ["Pickup", "Local Delivery", "Parcel", "Guaranteed Ground Freight", "LTL Freight"],
  paintFinishOptions: ["Standard Paint", "Custom Paint Match", "Natural Metal", "Anodized"],
  freightCategories: ["Parcel", "Oversize", "LTL", "Crated"],
};

export const architecturalLetterDefaults = {
  productType: "Flat Cut Metal",
  material: "Aluminum",
  finish: "Raw",
  thickness: '1/4"',
  returnDepth: '1"',
  mounting: "Stud Mount",
  lighting: "Non-Lit",
  letterHeight: 12,
  letterWidth: 12,
  quantity: 1,
  characterCount: 1,
  line1: "",
  line2: "",
  line3: "",
  excludeSpacesFromBilling: true,
  characterCountOverride: "",
  previewAlignment: "left",
  paintFinishOption: "Standard Paint",
  shippingMethod: "Pickup",
  freightCategory: "Parcel",
  shippingZip: "",
  sets: 1,
  freight: 0,
  oversizedFreight: 0,
  crateFee: 0,
  palletFee: 0,
  adjustment: 0,
  markupMultiplier: 1,
  manualUnitPrice: "",
  manualFinalRetail: "",
  freightOverride: "",
  notes: "",
};

export const computeArchitecturalLetterMetrics = (state) => {
  const lines = [state.line1 || "", state.line2 || "", state.line3 || ""];
  const joined = lines.join("");
  const spaces = (joined.match(/\s/g) || []).length;
  const letters = (joined.match(/[A-Za-z]/g) || []).length;
  const numbers = (joined.match(/[0-9]/g) || []).length;
  const punctuation = (joined.match(/[^A-Za-z0-9\s]/g) || []).length;
  const totalCharacters = joined.length;
  const autoBillable = state.excludeSpacesFromBilling ? totalCharacters - spaces : totalCharacters;
  const override = Number(state.characterCountOverride);
  const billableCharacters = Number.isFinite(override) && override > 0 ? override : Math.max(0, autoBillable);
  return { lines, letters, spaces, numbers, punctuation, totalCharacters, autoBillable, billableCharacters };
};

export const buildArchitecturalLetterPricingModel = (state, metrics = computeArchitecturalLetterMetrics(state)) => ({
  productType: state.productType,
  material: state.material,
  finish: state.finish,
  thickness: state.thickness,
  returnDepth: state.returnDepth,
  letterHeight: state.letterHeight,
  lightingType: state.lighting,
  letterLines: metrics.lines,
  billableCharacters: metrics.billableCharacters,
  characterBreakdown: {
    total: metrics.totalCharacters,
    letters: metrics.letters,
    spaces: metrics.spaces,
    punctuation: metrics.punctuation,
    numbers: metrics.numbers,
  },
  mountingType: state.mounting,
  paintFinishOption: state.paintFinishOption,
  freightCategory: state.freightCategory,
  minimumCharge: null,
  directCost: null,
  retailPrice: null,
  suggestedRetail: null,
  freight: null,
  freightPlaceholders: {
    estimatedFreight: state.freight || 0,
    oversizedFreight: state.oversizedFreight || 0,
    crateFee: state.crateFee || 0,
    palletFee: state.palletFee || 0,
  },
  mountingModifiers: { selected: state.mounting, hardware: "placeholder" },
  lightingModifiers: { selected: state.lighting, upcharge: null },
  returnDepthModifiers: { selected: state.returnDepth, upcharge: null },
  extensibility: {
    supports: ["logos/shapes", "cabinet signs", "plaques", "illuminated logos", "routed logos", "push-through acrylic", "install labor", "permit pricing"],
  },
  marginPercent: null,
  profitDollars: null,
  source: {
    pricingTableKey: null,
    wholesaleProfileKey: null,
  },
  inputSnapshot: state,
});
