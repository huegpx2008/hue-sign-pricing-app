export const displayProductsCatalog = [
  {
    id: "tear-drop-banner",
    category: "Display / Tradeshow Products",
    subcategory: "Flags",
    name: "TEAR DROP BANNER",
    status: "READY",
    sourceScreenshot: "public/data/display/Screenshot_20260516_162028_Chrome.jpg",
    previewImage: "/data/display/Screenshot_20260516_162028_Chrome.jpg",
    tags: ["Flags", "Outdoor", "Banner"],
    description:
      "Wind rated – 40 mile per hour winds – 200lbs strain-tested carbon fiber flexible pole system. Available in single and double sided.",
    productionNotes: [
      "Full color dye sublimation printing.",
      "Ships in 7–8 days.",
      "Carry bag included.",
      "12 month warranty.",
      "Crossbase water weight bag is included where cross base hardware is selected."
    ],
    featureIcons: ["UV Resistant", "Outdoor Rated"],
    moq: 1,
    sidedOptions: ["Single-Sided", "Double-Sided"],
    hardwareOptions: [
      "Set B (Poles + Ground Stake)",
      "Set C (Poles + Cross Base)",
      "Set D (Poles + Ground Stake + Cross Base)"
    ],
    sizes: [
      {
        id: "8ft",
        label: "8ft",
        tierPricingBySideAndHardware: {
          "Single-Sided": {
            "Set B (Poles + Ground Stake)": [
              { min: 1, max: 25, retailEach: 144.99 },
              { min: 26, max: 50, retailEach: 144.99 },
              { min: 51, max: 100, retailEach: "CALL" }
            ],
            "Set C (Poles + Cross Base)": [
              { min: 1, max: 25, retailEach: 184.99 },
              { min: 26, max: 50, retailEach: 184.99 },
              { min: 51, max: 100, retailEach: "CALL" }
            ],
            "Set D (Poles + Ground Stake + Cross Base)": [
              { min: 1, max: 25, retailEach: 223.99 },
              { min: 26, max: 50, retailEach: 223.99 },
              { min: 51, max: 100, retailEach: "CALL" }
            ]
          },
          "Double-Sided": {
            "Set B (Poles + Ground Stake)": [
              { min: 1, max: 25, retailEach: 184.99 },
              { min: 26, max: 50, retailEach: 184.99 },
              { min: 51, max: 100, retailEach: "CALL" }
            ],
            "Set C (Poles + Cross Base)": [
              { min: 1, max: 25, retailEach: 228.99 },
              { min: 26, max: 50, retailEach: 228.99 },
              { min: 51, max: 100, retailEach: "CALL" }
            ],
            "Set D (Poles + Ground Stake + Cross Base)": [
              { min: 1, max: 25, retailEach: 264.99 },
              { min: 26, max: 50, retailEach: 264.99 },
              { min: 51, max: 100, retailEach: "CALL" }
            ]
          }
        }
      }
    ]
  }
];
