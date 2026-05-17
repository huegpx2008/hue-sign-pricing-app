export const displayTradeshowCatalog = [
  {
    id: "feather-flag",
    category: "Display / Tradeshow Products",
    subcategory: "Flags",
    name: "Feather Flag",
    tags: ["Flags", "Outdoor", "Promo"],
    description:
      "Wind rated — 40 mile per hour winds, 200lbs strain-tested carbon fiber flexible pole system. Available in single and double sided. Sizes: 9ft, 12.5ft, and 17ft. Includes complete unit with ground stake stand and full color print.",
    imageReference: "Needs review",
    referenceStatus: "Needs review",
    adminNotes: [
      "Reference image path must use the real matching screenshot filename from public/data/display, not a made-up name.",
    ],
    freeShipping: false,
    moq: 1,
    soldInSets: false,
    replacementGraphicsSupported: true,
    hardwareOptions: ["Complete Unit with Ground Stake Stand"],
    sidedOptions: ["Single-Sided", "Double-Sided"],
    sizes: [
      {
        id: "9ft",
        label: "9ft",
        tierPricingBySide: {
          "Single-Sided": [
            { min: 1, max: 25, retailEach: 144.99 },
            { min: 26, max: 50, retailEach: 131.99 },
            { min: 51, max: 100, retailEach: "CALL" },
          ],
          "Double-Sided": [
            { min: 1, max: 25, retailEach: 184.99 },
            { min: 26, max: 50, retailEach: 166.99 },
            { min: 51, max: 100, retailEach: "CALL" },
          ],
        },
      },
      {
        id: "12_5ft",
        label: "12.5ft",
        tierPricingBySide: {
          "Single-Sided": [
            { min: 1, max: 25, retailEach: 184.99 },
            { min: 26, max: 50, retailEach: 166.99 },
            { min: 51, max: 100, retailEach: "CALL" },
          ],
          "Double-Sided": [
            { min: 1, max: 25, retailEach: 228.99 },
            { min: 26, max: 50, retailEach: 199.99 },
            { min: 51, max: 100, retailEach: "CALL" },
          ],
        },
      },
      {
        id: "17ft",
        label: "17ft",
        tierPricingBySide: {
          "Single-Sided": [
            { min: 1, max: 25, retailEach: 223.99 },
            { min: 26, max: 50, retailEach: 198.99 },
            { min: 51, max: 100, retailEach: "CALL" },
          ],
          "Double-Sided": [
            { min: 1, max: 25, retailEach: 264.99 },
            { min: 26, max: 50, retailEach: 231.99 },
            { min: 51, max: 100, retailEach: "CALL" },
          ],
        },
      },
    ],
  },
  {
    id: "tension-fabric-display-straight",
    category: "Display / Tradeshow Products",
    subcategory: "Tension Fabric Displays",
    name: "Straight Tension Fabric Display",
    tags: ["Tension Fabric Displays", "Backdrop", "Tradeshow"],
    description: "Needs review from uploaded display screenshot before pricing/options are enabled.",
    imageReference: "Needs review",
    referenceStatus: "Needs review",
    adminNotes: [
      "Reference image path must use the real matching screenshot filename from public/data/display, not a made-up name.",
    ],
    freeShipping: false,
    moq: 1,
    soldInSets: false,
    replacementGraphicsSupported: true,
    hardwareOptions: ["Needs review"],
    sidedOptions: ["Needs review"],
    sizes: [],
  },
];

export const displayTradeshowTagList = Array.from(
  new Set(displayTradeshowCatalog.flatMap((product) => product.tags))
).sort();
