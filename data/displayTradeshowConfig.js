export const displayTradeshowCatalog = [
  {
    id: "tension-fabric-display-straight",
    category: "Display / Tradeshow Products",
    subcategory: "Tension Fabric Displays",
    name: "Straight Tension Fabric Display",
    tags: ["Tension Fabric Displays", "Backdrop", "Tradeshow"],
    description: "Pillowcase-style fabric graphic over an aluminum tube frame for fast setup.",
    imageReference: "data/Gemini_Catalog/2026-U.S.-Professional-Signage-Catalog_Page_142.jpg",
    shippingNotes: "Free shipping on standard ground tiers as listed in catalog.",
    freeShipping: true,
    moq: 1,
    soldInSets: false,
    replacementGraphicsSupported: true,
    sidedOptions: ["Single-Sided", "Double-Sided"],
    hardwareOptions: ["With Hardware", "Graphic Only"],
    sizes: [
      {
        id: "8ft",
        label: "8ft",
        tierPricing: [
          { min: 1, max: 2, retailEach: 489 },
          { min: 3, max: 9, retailEach: 459 },
          { min: 10, max: null, retailEach: "CALL" }
        ]
      },
      {
        id: "10ft",
        label: "10ft",
        tierPricing: [
          { min: 1, max: 2, retailEach: 579 },
          { min: 3, max: 9, retailEach: 549 },
          { min: 10, max: null, retailEach: "CALL" }
        ]
      }
    ]
  },
  {
    id: "fabric-tower-triangle",
    category: "Display / Tradeshow Products",
    subcategory: "Fabric Towers",
    name: "Triangle Fabric Tower",
    tags: ["Fabric Towers", "Tradeshow", "Event Displays"],
    description: "Tall three-sided stretch fabric tower for high-visibility floor displays.",
    imageReference: "data/Gemini_Catalog/2026-U.S.-Professional-Signage-Catalog_Page_143.jpg",
    shippingNotes: "Crate/oversize freight may apply at higher quantities.",
    freeShipping: false,
    moq: 1,
    soldInSets: false,
    replacementGraphicsSupported: true,
    sidedOptions: ["Single-Sided"],
    hardwareOptions: ["With Hardware", "Graphic Only"],
    sizes: [
      { id: "small", label: "Small", tierPricing: [{ min: 1, max: 2, retailEach: 799 }, { min: 3, max: 6, retailEach: 749 }, { min: 7, max: null, retailEach: "CALL" }] },
      { id: "large", label: "Large", tierPricing: [{ min: 1, max: 2, retailEach: 989 }, { min: 3, max: 6, retailEach: 949 }, { min: 7, max: null, retailEach: "CALL" }] }
    ]
  },
  {
    id: "feather-flag",
    category: "Display / Tradeshow Products",
    subcategory: "Flags",
    name: "Feather Flag",
    tags: ["Flags", "Outdoor", "Promo"],
    description: "Outdoor feather flag system with optional stake or cross-base hardware.",
    imageReference: "data/Gemini_Catalog/2026-U.S.-Professional-Signage-Catalog_Page_147.jpg",
    freeShipping: false,
    moq: 1,
    soldInSets: false,
    replacementGraphicsSupported: true,
    sidedOptions: ["Single-Sided", "Double-Sided"],
    hardwareOptions: ["With Hardware", "Graphic Only"],
    sizes: [
      { id: "small", label: "Small", tierPricing: [{ min: 1, max: 5, retailEach: 179 }, { min: 6, max: 24, retailEach: 159 }, { min: 25, max: null, retailEach: "CALL" }] },
      { id: "medium", label: "Medium", tierPricing: [{ min: 1, max: 5, retailEach: 199 }, { min: 6, max: 24, retailEach: 179 }, { min: 25, max: null, retailEach: "CALL" }] }
    ]
  },
  {
    id: "garden-flags",
    category: "Display / Tradeshow Products",
    subcategory: "Flags",
    name: "Garden Flags",
    tags: ["Flags", "Set Quantity", "Garden"],
    description: "Residential/commercial garden flags sold in set quantities.",
    imageReference: "data/Gemini_Catalog/2026-U.S.-Professional-Signage-Catalog_Page_148.jpg",
    shippingNotes: "Set quantities only.",
    freeShipping: true,
    moq: 12,
    soldInSets: true,
    setQuantities: [12, 24, 48, 96],
    replacementGraphicsSupported: false,
    sidedOptions: ["Single-Sided", "Double-Sided"],
    hardwareOptions: ["With Hardware", "No Hardware"],
    sizes: [
      { id: "12x18", label: '12" x 18"', tierPricing: [{ min: 12, max: 12, retailEach: 19.5 }, { min: 24, max: 24, retailEach: 17.5 }, { min: 48, max: 48, retailEach: 15.95 }, { min: 96, max: 96, retailEach: "CALL" }] }
    ]
  },
  {
    id: "table-flags",
    category: "Display / Tradeshow Products",
    subcategory: "Flags",
    name: "Table Flags",
    tags: ["Table Flags", "Set Quantity", "Promo"],
    description: "Mini table flags for desks and event counters.",
    imageReference: "data/Gemini_Catalog/2026-U.S.-Professional-Signage-Catalog_Page_149.jpg",
    freeShipping: false,
    moq: 25,
    soldInSets: true,
    setQuantities: [25, 50, 100, 250],
    replacementGraphicsSupported: false,
    sidedOptions: ["Single-Sided"],
    hardwareOptions: ["With Hardware"],
    sizes: [
      { id: "4x6", label: '4" x 6"', tierPricing: [{ min: 25, max: 25, retailEach: 8.95 }, { min: 50, max: 50, retailEach: 7.5 }, { min: 100, max: 100, retailEach: 6.6 }, { min: 250, max: 250, retailEach: "CALL" }] }
    ]
  }
];

export const displayTradeshowTagList = Array.from(new Set(displayTradeshowCatalog.flatMap((product) => product.tags))).sort();
