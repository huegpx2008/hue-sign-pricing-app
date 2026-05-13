export const architecturalLetterSteps = [
  { id: "productType", title: "Product Type" },
  { id: "material", title: "Material" },
  { id: "finish", title: "Finish" },
  { id: "depth", title: "Depth / Thickness" },
  { id: "mounting", title: "Mounting" },
  { id: "lighting", title: "Lighting" },
  { id: "letterSize", title: "Letter Size" },
  { id: "characterCount", title: "Quantity / Character Count" },
  { id: "shipping", title: "Freight / Shipping" },
  { id: "summary", title: "Quote Summary" },
];

export const architecturalLetterCatalog = {
  productTypes: [
    "Flat Cut Metal",
    "Fabricated Metal",
    "Flat Cut Acrylic",
    "Formed Plastic",
    "Cast Metal",
    "Illuminated Letters",
    "Plaques",
    "Printed Dimensional Signage",
  ],
  materials: ["Aluminum", "Stainless Steel", "Brass", "Bronze", "Acrylic", "PVC"],
  lighting: ["Non-Lit", "Face Lit", "Halo Lit", "Face & Halo Lit"],
  mounting: ["Stud Mount", "Double Face Tape", "Flush Mount", "Raceway", "Pad Mount"],
  finishes: ["Raw", "Brushed", "Polished", "Painted", "Anodized", "Patina"],
  depths: ['1/8"', '1/4"', '1/2"', '3/4"', '1"', '1.5"', '2"'],
  shippingMethods: ["Pickup", "Local Delivery", "LTL Freight", "Parcel Shipping"],
};

export const architecturalLetterDefaults = {
  productType: "Flat Cut Metal",
  material: "Aluminum",
  finish: "Raw",
  depth: '1/4"',
  mounting: "Stud Mount",
  lighting: "Non-Lit",
  letterHeight: 12,
  letterWidth: 12,
  quantity: 1,
  characterCount: 1,
  shippingMethod: "Pickup",
  shippingZip: "",
  notes: "",
};

export const buildArchitecturalLetterPricingModel = (state) => ({
  directCost: null,
  retailPrice: null,
  suggestedRetail: null,
  freight: null,
  marginPercent: null,
  profitDollars: null,
  source: {
    pricingTableKey: null,
    wholesaleProfileKey: null,
  },
  inputSnapshot: state,
});
