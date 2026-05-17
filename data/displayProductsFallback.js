const fallbackNames = [
  "Tear Drop Banner","Feather Flag","Flutter Flag","Flying Flag","Standard Series Tents","Deluxe Table Throw","Custom Table Runners","Fitted Table Cover","Spandex Table Covers","Convertible Table Covers","Round Fitted Table Throw","Round Table Throw","Square Table Throw","Round Stretch Table Cover","Crossover Stretch Table Cover","Stretch Banquet Chair Cover","Popup Booth","Spring Up Display Counter","Table Top Banner - Side Panel","Table Top Banners","Folding Fabric Display Counter","Retractable Banner","Deluxe Retractable Banner","Pro Retractable Banner","X-Banner Stand","Step and Repeat Banner","Banner Wall","SEG Fabric Displays","Tension Fabric Displays","Flags","Table Flags","Pole Banner","Bollard Cover","Crowd Barrier Cover","Car Flags","Spare Tire Cover"
];

export const fallbackDisplayCatalog = fallbackNames.map((name) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  category: "Display / Tradeshow Products",
  subcategory: "Needs review",
  name,
  tags: ["Display", "Tradeshow", "Needs Review"],
  description: "Needs review from uploaded screenshot in public/data/display.",
  imageReference: "public/data/display/Needs review - map exact screenshot filename.jpg",
  parsedFromFile: "Needs review",
  ocrConfidence: null,
  status: "needs_review",
  missingFields: ["description", "sizes", "tierPricing", "hardwareOptions", "sidedOptions", "moq"],
  notes: "Fallback catalog entry created because parsed OCR dataset is empty. Replace with exact screenshot mapping + extracted details.",
  freeShipping: false,
  moq: null,
  soldInSets: false,
  setQuantities: [],
  replacementGraphicsSupported: null,
  hardwareOptions: [],
  sidedOptions: [],
  sizes: [],
  shippingNotes: "",
  productNotes: "",
}));
