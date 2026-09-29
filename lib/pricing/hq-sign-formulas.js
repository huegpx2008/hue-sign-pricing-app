// Generated from HQ lib/pricing/structured-sign-pricing.ts. Run HQ scripts/sync-pricing-formulas.cjs to regenerate.
export const BANNER_STRUCTURED_DEFAULTS = {
    kind: "banner",
    materials: [
        { key: "13-single", label: "13oz Single-Sided", costPerSqFt: 1.25, retailPerSqFt: 5 },
        { key: "13-double", label: "13oz Double-Sided", costPerSqFt: 1.25, retailPerSqFt: 8 },
        { key: "15-single", label: "15oz Single-Sided", costPerSqFt: 1.75, retailPerSqFt: 7 },
        { key: "18-single", label: "18oz Single-Sided", costPerSqFt: 2.25, retailPerSqFt: 9 },
        { key: "18-double", label: "18oz Double-Sided", costPerSqFt: 4.25, retailPerSqFt: 17 },
    ],
    polePocketPerPerimeterFt: 1,
    polePocketSetup: 10,
    ropePerPerimeterFt: 1,
    windSlitPerSqFt: 0.5,
    rushMultiplier: 2,
    standardShippingCost: 10,
    bulkShippingCost: 199,
    bulkShippingSqFtThreshold: 1_000,
};
export const YARD_SIGN_STRUCTURED_DEFAULTS = {
    kind: "yard-sign",
    width: 24,
    height: 18,
    sheetWidth: 48,
    sheetHeight: 96,
    marginPercent: 60,
    quantityTiers: [
        { minimumQuantity: 1, singleSidedEach: 25, doubleSidedEach: 28 },
        { minimumQuantity: 5, singleSidedEach: 15, doubleSidedEach: 18 },
        { minimumQuantity: 10, singleSidedEach: 13.75, doubleSidedEach: 16.75 },
        { minimumQuantity: 24, singleSidedEach: 10.75, doubleSidedEach: 13.7 },
        { minimumQuantity: 50, singleSidedEach: 9.9, doubleSidedEach: 12.9 },
        { minimumQuantity: 100, singleSidedEach: 8.25, doubleSidedEach: 11.75 },
    ],
    sheetCostTiers: [
        { maximumSheets: 9, singleSidedPerSheet: 44, doubleSidedPerSheet: 55 },
        { maximumSheets: 50, singleSidedPerSheet: 33, doubleSidedPerSheet: 44 },
        { maximumSheets: null, singleSidedPerSheet: 30, doubleSidedPerSheet: 40 },
    ],
    standardStakeRetailEach: 2,
    standardStakeCostEach: 1.25,
    heavyStakeUpchargeEach: 2.25,
    shippingGroupSize: 3,
    shippingPerGroup: 10,
    bulkShippingSheetThreshold: 58,
    bulkShippingCost: 199,
};
export const SHEET_SHIPPING_DEFAULTS = {
    groupSize: 3,
    smallMaxLongInches: 36,
    smallMaxShortInches: 24,
    smallBulkSheetThreshold: 58,
    smallPerGroupCost: 10,
    mediumMaxLongInches: 48,
    mediumMaxShortInches: 32,
    mediumBulkSheetThreshold: 22,
    mediumPerGroupCost: 15,
    mediumWideMaxLongInches: 48,
    mediumWideMaxShortInches: 36,
    mediumWideBulkSheetThreshold: 22,
    mediumWidePerGroupCost: 35,
    squareMaxInches: 48,
    squareBulkSheetThreshold: 10,
    squareMidSheetThreshold: 6,
    squareBaseCost: 50,
    squareMidCost: 75,
    longMaxLongInches: 72,
    longMaxShortInches: 39,
    extraLongMaxLongInches: 96,
    extraLongMaxShortInches: 24,
    longBulkSheetThreshold: 10,
    longBaseCost: 75,
    oversizedCost: 199,
};
export const ACM_STRUCTURED_DEFAULTS = {
    kind: "acm",
    materials: [
        { key: "3-single", label: "3mm Single-Sided", costPerSqIn: 0.05, minimumCostEach: 7.2 },
        { key: "3-double", label: "3mm Double-Sided", costPerSqIn: 0.06, minimumCostEach: 8.64 },
        { key: "6-single", label: "6mm Single-Sided", costPerSqIn: 0.08, minimumCostEach: 11.52 },
        { key: "6-double", label: "6mm Double-Sided", costPerSqIn: 0.09, minimumCostEach: 12.96 },
    ],
    marginPercent: 60,
    shopRetailPerSqFt: 18,
    roundedCornerFlatCharge: 5,
    contourMultiplier: 1.15,
    sheetWidth: 48,
    sheetHeight: 96,
    shipping: SHEET_SHIPPING_DEFAULTS,
};
export const VINYL_STRUCTURED_DEFAULTS = {
    kind: "vinyl",
    materials: [
        { key: "standard", label: "GF 203OAPAE Standard Vinyl", engineMaterial: "gf-standard", costPerSqFt: 2.49, retailPerSqFt: 8.75 },
        { key: "premium", label: "3M IJ-35C Premium Vinyl", engineMaterial: "3m-premium", costPerSqFt: 2.99, retailPerSqFt: 10.51 },
        { key: "footprints", label: "Footprints Vinyl", engineMaterial: "footprints", costPerSqFt: 2.5, retailPerSqFt: 0 },
        { key: "reflective", label: "Oralite 5600 Reflective Film", engineMaterial: "reflective", costPerSqFt: 8, retailPerSqFt: 8 },
        { key: "low-tack-wall", label: "Low Tac Wall Vinyl", engineMaterial: "low-tac-wall", costPerSqFt: 3.47, retailPerSqFt: 12.2 },
        { key: "premium-vehicle", label: "3M Controltac Premium Vehicle Vinyl", engineMaterial: "3m-controltac", costPerSqFt: 4.99, retailPerSqFt: 17.54 },
    ],
    marginPercent: 60,
    contourMultiplier: 1.15,
    contourPaddingInches: 0.5,
    gangWastePercent: 15,
    rollWidthInches: 52,
    rushMultiplier: 2,
    standardShippingCost: 10,
    bulkShippingCost: 199,
    bulkShippingSqFtThreshold: 1_000,
};
export const CUSTOM_COROPLAST_STRUCTURED_DEFAULTS = {
    kind: "custom-cut-coroplast",
    sheetWidth: 48,
    sheetHeight: 96,
    marginPercent: 60,
    sheetCostTiers: [
        { maximumSheets: 9, singleSidedPerSheet: 44, doubleSidedPerSheet: 55 },
        { maximumSheets: 50, singleSidedPerSheet: 33, doubleSidedPerSheet: 44 },
        { maximumSheets: null, singleSidedPerSheet: 30, doubleSidedPerSheet: 40 },
    ],
    handlingTiers: [
        { maximumQuantity: 10, perPiece: 2 },
        { maximumQuantity: 50, perPiece: 1.5 },
        { maximumQuantity: null, perPiece: 1 },
    ],
    standardStakeRetailEach: 2,
    standardStakeCostEach: 1.25,
    heavyStakeUpchargeEach: 2.25,
    grommetEach: 0.25,
    grommetSetup: 15,
    glossEach: 4,
    contourMultiplier: 1.15,
    rushMultiplier: 2,
    shipping: SHEET_SHIPPING_DEFAULTS,
};
export const VEHICLE_MAGNET_STRUCTURED_DEFAULTS = {
    standardPresetCosts: { "18x12": 11.95, "24x12": 14.95, "24x18": 20.95, "42x12": 29.95, "72x24": 89.7 },
    standardShippingGroupSize: 10,
    standardBulkQuantity: 191,
    kind: "vehicle-magnet",
    costPerSqIn: 0.07,
    marginPercent: 60,
    contourMultiplier: 1.15,
    rushMultiplier: 2,
    standardShippingCost: 10,
    bulkShippingCost: 199,
    bulkShippingSqInThreshold: 40_500,
};
export const MESH_BANNER_STRUCTURED_DEFAULTS = {
    kind: "mesh-banner",
    marginPercent: 60,
    supplierRateTiers: [
        { minimumSqFt: 0, costPerSqFt: 2.44 },
        { minimumSqFt: 1_000, costPerSqFt: 1.49 },
        { minimumSqFt: 2_500, costPerSqFt: 1.09 },
        { minimumSqFt: 5_000, costPerSqFt: 0.99 },
    ],
    polePocketPerPerimeterFt: 1,
    polePocketSetup: 10,
    ropePerPerimeterFt: 1,
    webbingPerPerimeterFt: 1,
    rushMultiplier: 2,
    standardShippingCost: 10,
    bulkShippingCost: 199,
    bulkShippingSqFtThreshold: 1_000,
    oversizedWidthInches: 123,
    oversizedHeightInches: 123,
};
export const POSTER_STRUCTURED_DEFAULTS = {
    kind: "poster",
    marginPercent: 60,
    supplierRateTiers: [
        { minimumSqFt: 0, costPerSqFt: 2 },
        { minimumSqFt: 1_000, costPerSqFt: 1.5 },
        { minimumSqFt: 5_000, costPerSqFt: 1 },
    ],
    rushMultiplier: 2,
    standardShippingCost: 10,
    bulkShippingCost: 199,
    bulkShippingSqFtThreshold: 1_000,
    oversizedDimensionInches: 123,
};
export const ACRYLIC_STRUCTURED_DEFAULTS = {
    kind: "acrylic",
    costPerSqIn: 0.1,
    minimumCostEach: 14.4,
    marginPercent: 60,
    roundedCornerFlatCharge: 5,
    contourMultiplier: 1.15,
    sheetWidth: 48,
    sheetHeight: 96,
    standOffRates: [
        { key: "silver", label: "Silver", directEach: 2.5, retailEach: 4 },
        { key: "black", label: "Black", directEach: 3.5, retailEach: 5 },
    ],
    shipping: SHEET_SHIPPING_DEFAULTS,
};
export const FOAMCORE_STRUCTURED_DEFAULTS = {
    kind: "foamcore",
    sheetWidth: 48,
    sheetHeight: 96,
    marginPercent: 60,
    sheetCostTiers: [
        { maximumSheets: 9, singleSidedPerSheet: 70, doubleSidedPerSheet: 80 },
        { maximumSheets: 50, singleSidedPerSheet: 55, doubleSidedPerSheet: 65 },
        { maximumSheets: null, singleSidedPerSheet: 50, doubleSidedPerSheet: 60 },
    ],
    handlingTiers: [
        { maximumQuantity: 10, perPiece: 1.75 },
        { maximumQuantity: 50, perPiece: 1.25 },
        { maximumQuantity: null, perPiece: 1 },
    ],
    glossEach: 4,
    contourMultiplier: 1.15,
    rushMultiplier: 2,
    shipping: SHEET_SHIPPING_DEFAULTS,
};
export const PVC_STRUCTURED_DEFAULTS = {
    kind: "pvc",
    sheetWidth: 48,
    sheetHeight: 96,
    marginPercent: 60,
    materials: [
        { key: "3-single", label: "3mm Single-Sided", sheetCostTiers: [{ maximumSheets: 9, perSheet: 65 }, { maximumSheets: 17, perSheet: 55 }, { maximumSheets: null, perSheet: 50 }] },
        { key: "3-double", label: "3mm Double-Sided", sheetCostTiers: [{ maximumSheets: 9, perSheet: 85 }, { maximumSheets: 17, perSheet: 70 }, { maximumSheets: null, perSheet: 60 }] },
        { key: "6-single", label: "6mm Single-Sided", sheetCostTiers: [{ maximumSheets: 9, perSheet: 95 }, { maximumSheets: 17, perSheet: 85 }, { maximumSheets: null, perSheet: 75 }] },
        { key: "6-double", label: "6mm Double-Sided", sheetCostTiers: [{ maximumSheets: 9, perSheet: 115 }, { maximumSheets: 17, perSheet: 100 }, { maximumSheets: null, perSheet: 85 }] },
    ],
    handlingTiers: [
        { maximumQuantity: 10, perPiece: 2.5 },
        { maximumQuantity: 50, perPiece: 2 },
        { maximumQuantity: null, perPiece: 1.5 },
    ],
    contourMultiplier: 1.15,
    rushMultiplier: 2,
    shipping: SHEET_SHIPPING_DEFAULTS,
};
export const POLYSTYRENE_STRUCTURED_DEFAULTS = {
    kind: "polystyrene",
    sheetWidth: 48,
    sheetHeight: 96,
    marginPercent: 60,
    sheetCostTiers: [
        { maximumSheets: 9, singleSidedPerSheet: 55, doubleSidedPerSheet: 65 },
        { maximumSheets: 50, singleSidedPerSheet: 45, doubleSidedPerSheet: 55 },
        { maximumSheets: null, singleSidedPerSheet: 40, doubleSidedPerSheet: 50 },
    ],
    handlingTiers: [
        { maximumQuantity: 10, perPiece: 2.5 },
        { maximumQuantity: 50, perPiece: 2 },
        { maximumQuantity: null, perPiece: 1.5 },
    ],
    glossDirectCostEach: 4,
    contourMultiplier: 1.15,
    rushMultiplier: 2,
    shipping: SHEET_SHIPPING_DEFAULTS,
};
export const ALUMINUM_STRUCTURED_DEFAULTS = {
    kind: "aluminum",
    sheetWidth: 48,
    sheetHeight: 96,
    marginPercent: 60,
    materials: [
        { key: "040-single", label: ".040 Single-Sided", costPerSqIn: 0.06, minimumCostEach: 8.64, sheetCostTiers: [{ maximumSheets: 9, perSheet: 175 }, { maximumSheets: 17, perSheet: 165 }, { maximumSheets: null, perSheet: 155 }] },
        { key: "040-double", label: ".040 Double-Sided", costPerSqIn: 0.07, minimumCostEach: 10.08, sheetCostTiers: [{ maximumSheets: 9, perSheet: 200 }, { maximumSheets: 17, perSheet: 190 }, { maximumSheets: null, perSheet: 180 }] },
        { key: "080-single", label: ".080 Single-Sided", costPerSqIn: 0.10, minimumCostEach: 14.4, sheetCostTiers: [{ maximumSheets: 9, perSheet: 300 }, { maximumSheets: 17, perSheet: 290 }, { maximumSheets: null, perSheet: 280 }] },
        { key: "080-double", label: ".080 Double-Sided", costPerSqIn: 0.11, minimumCostEach: 15.84, sheetCostTiers: [{ maximumSheets: 9, perSheet: 325 }, { maximumSheets: 17, perSheet: 315 }, { maximumSheets: null, perSheet: 305 }] },
    ],
    contourMultiplier: 1.15,
    roundedCornerSqInDirectFee: 5,
    roundedCornerSheetDirectFee: 15,
    roundedCornerRetailFee: 8,
    roundedCornerOptimizedRetailFee: 20,
    shipping: {
        ...SHEET_SHIPPING_DEFAULTS,
        smallBulkSheetThreshold: 10,
        mediumBulkSheetThreshold: 10,
        mediumWideBulkSheetThreshold: 10,
    },
};
export const BUSINESS_CARD_STRUCTURED_DEFAULTS = {
    kind: "business-card",
    priceTiers: [
        { quantity: 250, singleSidedTotal: 39.99, doubleSidedTotal: 49.99 },
        { quantity: 500, singleSidedTotal: 49.99, doubleSidedTotal: 59.99 },
        { quantity: 1000, singleSidedTotal: 59.99, doubleSidedTotal: 69.99 },
    ],
    rushMultiplier: 2,
    freightDirectCost: 10,
};
export const HANDHELD_PAPER_STRUCTURED_DEFAULTS = {
    kind: "handheld-paper",
    sizes: [
        { key: "3.5x2.5", label: "3.5\"x2.5\" Trading Card", piecesPerSheet: 56, width: 3.5, height: 2.5 },
        { key: "5x3", label: "5\"x3\"", piecesPerSheet: 30, width: 5, height: 3 },
        { key: "6x4", label: "6\"x4\"", piecesPerSheet: 21, width: 6, height: 4 },
        { key: "7x5", label: "7\"x5\"", piecesPerSheet: 12, width: 7, height: 5 },
        { key: "9x4", label: "9\"x4\"", piecesPerSheet: 14, width: 9, height: 4 },
        { key: "9x6", label: "9\"x6\"", piecesPerSheet: 9, width: 9, height: 6 },
        { key: "11x8.5", label: "11\"x8.5\"", piecesPerSheet: 5, width: 11, height: 8.5 },
        { key: "14x11", label: "14\"x11\"", piecesPerSheet: 2, width: 14, height: 11 },
        { key: "16x12", label: "16\"x12\"", piecesPerSheet: 2, width: 16, height: 12 },
        { key: "17x11", label: "17\"x11\"", piecesPerSheet: 2, width: 17, height: 11 },
        { key: "12x18", label: "12\"x18\"", piecesPerSheet: 2, width: 12, height: 18 },
        { key: "20x16", label: "20\"x16\"", piecesPerSheet: 1, width: 20, height: 16 },
        { key: "18x28", label: "18\"x28\"", piecesPerSheet: 1, width: 18, height: 28 },
    ],
    areaRateTiers: [
        { minimumQuantity: 1, referenceQuantity: 250, referenceTotal: 39.99 },
        { minimumQuantity: 500, referenceQuantity: 500, referenceTotal: 49.99 },
        { minimumQuantity: 1000, referenceQuantity: 1000, referenceTotal: 59.99 },
    ],
    referenceAreaSqIn: 7,
    materialCostPerSheet: 2,
    marginPercent: 60,
    rushMultiplier: 2,
    freightSheetGroupSize: 100,
    freightPerGroup: 10,
};
export const CARBONLESS_STRUCTURED_DEFAULTS = {
    kind: "carbonless",
    costGroups: [
        { size: "8.5\" x 11\"", formType: "2 Part", costs: [
                { quantity: 100, blackInk: 65, fullColor: 69 }, { quantity: 250, blackInk: 82, fullColor: 129 }, { quantity: 500, blackInk: 102, fullColor: 249 }, { quantity: 1000, blackInk: 175, fullColor: 419 }, { quantity: 2000, blackInk: 316, fullColor: null }, { quantity: 2500, blackInk: 363, fullColor: 829 }, { quantity: 5000, blackInk: 645, fullColor: 1229 }, { quantity: 7500, blackInk: 935, fullColor: null }, { quantity: 10000, blackInk: 1208, fullColor: null },
            ] },
        { size: "8.5\" x 11\"", formType: "3 Part", costs: [
                { quantity: 100, blackInk: 79, fullColor: 99 }, { quantity: 250, blackInk: 102, fullColor: 179 }, { quantity: 500, blackInk: 131, fullColor: 309 }, { quantity: 1000, blackInk: 246, fullColor: 599 }, { quantity: 2000, blackInk: 441, fullColor: null }, { quantity: 2500, blackInk: 522, fullColor: 1059 }, { quantity: 5000, blackInk: 965, fullColor: 1549 }, { quantity: 7500, blackInk: 1433, fullColor: null }, { quantity: 10000, blackInk: 1799, fullColor: null },
            ] },
        { size: "8.5\" x 11\"", formType: "4 Part", costs: [
                { quantity: 100, blackInk: 115, fullColor: 129 }, { quantity: 250, blackInk: 133, fullColor: 229 }, { quantity: 500, blackInk: 220, fullColor: 429 }, { quantity: 1000, blackInk: 367, fullColor: 819 }, { quantity: 2000, blackInk: 661, fullColor: null }, { quantity: 2500, blackInk: 776, fullColor: 1269 }, { quantity: 5000, blackInk: 1299, fullColor: 1939 }, { quantity: 7500, blackInk: 1860, fullColor: null }, { quantity: 10000, blackInk: 2356, fullColor: null },
            ] },
        { size: "5.5\" x 8.5\"", formType: "2 Part", costs: [
                { quantity: 100, blackInk: 45, fullColor: 49 }, { quantity: 250, blackInk: 63, fullColor: 89 }, { quantity: 500, blackInk: 80, fullColor: 139 }, { quantity: 1000, blackInk: 127, fullColor: 259 }, { quantity: 2000, blackInk: 208, fullColor: null }, { quantity: 2500, blackInk: 244, fullColor: 499 }, { quantity: 5000, blackInk: 406, fullColor: 849 }, { quantity: 7500, blackInk: 545, fullColor: null }, { quantity: 10000, blackInk: 720, fullColor: null },
            ] },
        { size: "5.5\" x 8.5\"", formType: "3 Part", costs: [
                { quantity: 100, blackInk: 63, fullColor: 69 }, { quantity: 250, blackInk: 80, fullColor: 129 }, { quantity: 500, blackInk: 111, fullColor: 189 }, { quantity: 1000, blackInk: 173, fullColor: 319 }, { quantity: 2000, blackInk: 286, fullColor: null }, { quantity: 2500, blackInk: 325, fullColor: 649 }, { quantity: 5000, blackInk: 545, fullColor: 1099 }, { quantity: 7500, blackInk: 801, fullColor: null }, { quantity: 10000, blackInk: 1046, fullColor: null },
            ] },
        { size: "5.5\" x 8.5\"", formType: "4 Part", costs: [
                { quantity: 100, blackInk: 92, fullColor: 79 }, { quantity: 250, blackInk: 110, fullColor: 149 }, { quantity: 500, blackInk: 123, fullColor: 239 }, { quantity: 1000, blackInk: 207, fullColor: 439 }, { quantity: 2000, blackInk: 358, fullColor: null }, { quantity: 2500, blackInk: 414, fullColor: 859 }, { quantity: 5000, blackInk: 705, fullColor: 1299 }, { quantity: 7500, blackInk: 1028, fullColor: null }, { quantity: 10000, blackInk: 1284, fullColor: null },
            ] },
        { size: "8.5\" x 14\"", formType: "2 Part", costs: [
                { quantity: 100, blackInk: 92, fullColor: null }, { quantity: 250, blackInk: 110, fullColor: null }, { quantity: 500, blackInk: 145, fullColor: null }, { quantity: 1000, blackInk: 230, fullColor: null }, { quantity: 2000, blackInk: 438, fullColor: null }, { quantity: 2500, blackInk: 474, fullColor: null }, { quantity: 5000, blackInk: 855, fullColor: null }, { quantity: 7500, blackInk: 1130, fullColor: null }, { quantity: 10000, blackInk: 1428, fullColor: null },
            ] },
        { size: "8.5\" x 14\"", formType: "3 Part", costs: [
                { quantity: 100, blackInk: 109, fullColor: null }, { quantity: 250, blackInk: 141, fullColor: null }, { quantity: 500, blackInk: 191, fullColor: null }, { quantity: 1000, blackInk: 311, fullColor: null }, { quantity: 2000, blackInk: 600, fullColor: null }, { quantity: 2500, blackInk: 666, fullColor: null }, { quantity: 5000, blackInk: 1175, fullColor: null }, { quantity: 7500, blackInk: 1640, fullColor: null }, { quantity: 10000, blackInk: 2081, fullColor: null },
            ] },
        { size: "8.5\" x 14\"", formType: "4 Part", costs: [
                { quantity: 100, blackInk: 138, fullColor: null }, { quantity: 250, blackInk: 179, fullColor: null }, { quantity: 500, blackInk: 248, fullColor: null }, { quantity: 1000, blackInk: 416, fullColor: null }, { quantity: 2000, blackInk: 801, fullColor: null }, { quantity: 2500, blackInk: 934, fullColor: null }, { quantity: 5000, blackInk: 1576, fullColor: null }, { quantity: 7500, blackInk: 2325, fullColor: null }, { quantity: 10000, blackInk: 2983, fullColor: null },
            ] },
    ],
    fullColorFallbackMultiplier: 1.25,
    frontBackMultiplier: 1.2,
    numberingTiers: [
        { minimumQuantity: 1, flatCost: 15 },
        { minimumQuantity: 1000, flatCost: 25 },
        { minimumQuantity: 2500, flatCost: 40 },
        { minimumQuantity: 5000, flatCost: 60 },
    ],
    wraparoundFlatCost: 35,
    bookedSetsFlatCost: 25,
    retailMultiplier: 2.7,
    rushMultiplier: 2,
};
export const DOOR_HANGER_STOCK_TYPES = [
    "White 80lb Cover Uncoated",
    "White 80lb Cover Gloss",
    "14pt Gloss Front - Uncoated Back",
    "14pt Gloss Front and Back",
    "14pt Uncoated Front and Back",
    "14pt Matte Front - Uncoated Back",
    "14pt Matte Front and Back",
    "16pt Matte Front - Uncoated Back",
    "16pt Matte Front and Back",
    "16pt Uncoated Front and Back",
    "16pt Gloss Front and Back",
    "16pt Gloss Front - Uncoated Back",
    "18pt Gloss Front - Uncoated Back",
    "18pt Matte Front - Uncoated Back",
    "65lb Shocking Pink Cover Uncoated",
    "65lb Yellow Light Cover Uncoated",
    "65lb Shocking Green Cover Uncoated",
    "65lb Blue Light Cover Uncoated",
    "65lb Orange Light Cover Uncoated",
];
export const DOOR_HANGER_STRUCTURED_DEFAULTS = {
    kind: "door-hanger",
    sizes: [
        { key: "3.5 x 8.5", areaSqIn: 29.75 },
        { key: "4 x 11", areaSqIn: 44 },
        { key: "5.25 x 8.5", areaSqIn: 44.625 },
        { key: "8.5 x 11", areaSqIn: 93.5 },
    ],
    referenceQuantity: 500,
    referenceDirectCost: 131,
    frontInkMultipliers: [
        { key: "Standard Black", multiplier: 1 },
        { key: "Full Color", multiplier: 1.2 },
    ],
    backPrintingMultipliers: [
        { key: "No", multiplier: 1 },
        { key: "Standard Black", multiplier: 1.12 },
        { key: "Full Color", multiplier: 1.2 },
    ],
    perforationMultiplierPerCount: 0.03,
    shrinkWrapMultipliers: [
        { key: "Shrink Wrap 250", multiplier: 1 },
        { key: "Shrink Wrap 25s", multiplier: 1.05 },
        { key: "Shrink Wrap 50s", multiplier: 1.03 },
        { key: "Shrink Wrap 100s", multiplier: 1.02 },
    ],
    marginPercent: 60,
};
function finite(value, label, min = 0, max = 1_000_000) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < min || number > max)
        throw new Error(`${label} must be between ${min} and ${max}.`);
    return number;
}
function object(value, label) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error(`${label} is invalid.`);
    return value;
}
function parseBanner(value) {
    const candidate = object(value, "Banner pricing");
    if (candidate.kind !== "banner" || !Array.isArray(candidate.materials) || candidate.materials.length !== BANNER_STRUCTURED_DEFAULTS.materials.length)
        throw new Error("Banner material pricing is incomplete.");
    const expectedKeys = BANNER_STRUCTURED_DEFAULTS.materials.map((material) => material.key);
    const materials = candidate.materials.map((entry, index) => {
        const material = object(entry, "Banner material");
        if (material.key !== expectedKeys[index])
            throw new Error("Banner material order or identity changed unexpectedly.");
        return {
            key: expectedKeys[index],
            label: BANNER_STRUCTURED_DEFAULTS.materials[index].label,
            costPerSqFt: finite(material.costPerSqFt, `${expectedKeys[index]} cost`, 0, 10_000),
            retailPerSqFt: finite(material.retailPerSqFt, `${expectedKeys[index]} retail`, 0, 10_000),
        };
    });
    return {
        kind: "banner",
        materials,
        polePocketPerPerimeterFt: finite(candidate.polePocketPerPerimeterFt, "Pole-pocket perimeter rate", 0, 1_000),
        polePocketSetup: finite(candidate.polePocketSetup, "Pole-pocket setup", 0, 10_000),
        ropePerPerimeterFt: finite(candidate.ropePerPerimeterFt, "Rope perimeter rate", 0, 1_000),
        windSlitPerSqFt: finite(candidate.windSlitPerSqFt, "Wind-slit rate", 0, 1_000),
        rushMultiplier: finite(candidate.rushMultiplier, "Rush multiplier", 0, 20),
        standardShippingCost: finite(candidate.standardShippingCost, "Standard freight cost", 0, 100_000),
        bulkShippingCost: finite(candidate.bulkShippingCost, "Bulk freight cost", 0, 100_000),
        bulkShippingSqFtThreshold: finite(candidate.bulkShippingSqFtThreshold, "Bulk freight threshold", 1, 1_000_000),
    };
}
function parseYardSign(value) {
    const candidate = object(value, "Yard-sign pricing");
    if (candidate.kind !== "yard-sign" || !Array.isArray(candidate.quantityTiers) || candidate.quantityTiers.length !== 6 || !Array.isArray(candidate.sheetCostTiers) || candidate.sheetCostTiers.length !== 3)
        throw new Error("Yard-sign pricing tiers are incomplete.");
    const quantityTiers = candidate.quantityTiers.map((entry, index) => {
        const tier = object(entry, "Yard-sign quantity tier");
        return {
            minimumQuantity: finite(tier.minimumQuantity, `Quantity tier ${index + 1}`, 1, 1_000_000),
            singleSidedEach: finite(tier.singleSidedEach, `Single-sided tier ${index + 1}`, 0, 100_000),
            doubleSidedEach: finite(tier.doubleSidedEach, `Double-sided tier ${index + 1}`, 0, 100_000),
        };
    });
    if (quantityTiers.some((tier, index) => index > 0 && tier.minimumQuantity <= quantityTiers[index - 1].minimumQuantity))
        throw new Error("Yard-sign quantity breaks must increase from top to bottom.");
    const sheetCostTiers = candidate.sheetCostTiers.map((entry, index) => {
        const tier = object(entry, "Yard-sign sheet-cost tier");
        const maximumSheets = index === 2 ? null : finite(tier.maximumSheets, `Sheet tier ${index + 1}`, 1, 1_000_000);
        return {
            maximumSheets,
            singleSidedPerSheet: finite(tier.singleSidedPerSheet, `Single-sided sheet cost ${index + 1}`, 0, 100_000),
            doubleSidedPerSheet: finite(tier.doubleSidedPerSheet, `Double-sided sheet cost ${index + 1}`, 0, 100_000),
        };
    });
    if (Number(sheetCostTiers[1].maximumSheets) <= Number(sheetCostTiers[0].maximumSheets))
        throw new Error("Yard-sign sheet thresholds must increase.");
    return {
        kind: "yard-sign",
        width: finite(candidate.width, "Yard-sign width", 1, 1_000),
        height: finite(candidate.height, "Yard-sign height", 1, 1_000),
        sheetWidth: finite(candidate.sheetWidth, "Sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "Sheet height", 1, 1_000),
        marginPercent: finite(candidate.marginPercent, "Margin target", 0, 95),
        quantityTiers,
        sheetCostTiers,
        standardStakeRetailEach: finite(candidate.standardStakeRetailEach, "Standard stake retail", 0, 10_000),
        standardStakeCostEach: finite(candidate.standardStakeCostEach, "Standard stake cost", 0, 10_000),
        heavyStakeUpchargeEach: finite(candidate.heavyStakeUpchargeEach, "Heavy stake upcharge", 0, 10_000),
        shippingGroupSize: finite(candidate.shippingGroupSize, "Freight group size", 1, 10_000),
        shippingPerGroup: finite(candidate.shippingPerGroup, "Freight per group", 0, 100_000),
        bulkShippingSheetThreshold: finite(candidate.bulkShippingSheetThreshold, "Bulk freight sheet threshold", 1, 1_000_000),
        bulkShippingCost: finite(candidate.bulkShippingCost, "Bulk freight cost", 0, 100_000),
    };
}
function parseSheetShipping(value) {
    const candidate = object(value, "Sheet freight pricing");
    return {
        groupSize: finite(candidate.groupSize, "Freight group size", 1, 10_000),
        smallMaxLongInches: finite(candidate.smallMaxLongInches, "Small freight maximum long side", 1, 1_000),
        smallMaxShortInches: finite(candidate.smallMaxShortInches, "Small freight maximum short side", 1, 1_000),
        smallBulkSheetThreshold: finite(candidate.smallBulkSheetThreshold, "Small freight bulk threshold", 1, 1_000_000),
        smallPerGroupCost: finite(candidate.smallPerGroupCost, "Small freight per group", 0, 100_000),
        mediumMaxLongInches: finite(candidate.mediumMaxLongInches, "Medium freight maximum long side", 1, 1_000),
        mediumMaxShortInches: finite(candidate.mediumMaxShortInches, "Medium freight maximum short side", 1, 1_000),
        mediumBulkSheetThreshold: finite(candidate.mediumBulkSheetThreshold, "Medium freight bulk threshold", 1, 1_000_000),
        mediumPerGroupCost: finite(candidate.mediumPerGroupCost, "Medium freight per group", 0, 100_000),
        mediumWideMaxLongInches: finite(candidate.mediumWideMaxLongInches, "Medium-wide freight maximum long side", 1, 1_000),
        mediumWideMaxShortInches: finite(candidate.mediumWideMaxShortInches, "Medium-wide freight maximum short side", 1, 1_000),
        mediumWideBulkSheetThreshold: finite(candidate.mediumWideBulkSheetThreshold, "Medium-wide freight bulk threshold", 1, 1_000_000),
        mediumWidePerGroupCost: finite(candidate.mediumWidePerGroupCost, "Medium-wide freight per group", 0, 100_000),
        squareMaxInches: finite(candidate.squareMaxInches, "Square freight maximum side", 1, 1_000),
        squareBulkSheetThreshold: finite(candidate.squareBulkSheetThreshold, "Square freight bulk threshold", 1, 1_000_000),
        squareMidSheetThreshold: finite(candidate.squareMidSheetThreshold, "Square freight middle threshold", 1, 1_000_000),
        squareBaseCost: finite(candidate.squareBaseCost, "Square freight base cost", 0, 100_000),
        squareMidCost: finite(candidate.squareMidCost, "Square freight middle cost", 0, 100_000),
        longMaxLongInches: finite(candidate.longMaxLongInches, "Long freight maximum long side", 1, 1_000),
        longMaxShortInches: finite(candidate.longMaxShortInches, "Long freight maximum short side", 1, 1_000),
        extraLongMaxLongInches: finite(candidate.extraLongMaxLongInches, "Extra-long freight maximum long side", 1, 1_000),
        extraLongMaxShortInches: finite(candidate.extraLongMaxShortInches, "Extra-long freight maximum short side", 1, 1_000),
        longBulkSheetThreshold: finite(candidate.longBulkSheetThreshold, "Long freight bulk threshold", 1, 1_000_000),
        longBaseCost: finite(candidate.longBaseCost, "Long freight base cost", 0, 100_000),
        oversizedCost: finite(candidate.oversizedCost, "Oversized freight cost", 0, 100_000),
    };
}
function parseAcm(value) {
    const candidate = object(value, "ACM pricing");
    if (candidate.kind !== "acm" || !Array.isArray(candidate.materials) || candidate.materials.length !== ACM_STRUCTURED_DEFAULTS.materials.length)
        throw new Error("ACM material pricing is incomplete.");
    const materials = candidate.materials.map((entry, index) => {
        const material = object(entry, "ACM material");
        const expected = ACM_STRUCTURED_DEFAULTS.materials[index];
        if (material.key !== expected.key)
            throw new Error("ACM material order or identity changed unexpectedly.");
        return {
            key: expected.key,
            label: expected.label,
            costPerSqIn: finite(material.costPerSqIn, `${expected.key} cost`, 0, 10_000),
            minimumCostEach: finite(material.minimumCostEach, `${expected.key} minimum cost`, 0, 100_000),
        };
    });
    const shipping = parseSheetShipping(candidate.shipping);
    if (shipping.squareMidSheetThreshold >= shipping.squareBulkSheetThreshold)
        throw new Error("Square freight thresholds must increase.");
    return {
        kind: "acm",
        materials,
        marginPercent: finite(candidate.marginPercent, "ACM margin target", 0, 95),
        shopRetailPerSqFt: finite(candidate.shopRetailPerSqFt, "ACM shop retail rate", 0, 100_000),
        roundedCornerFlatCharge: finite(candidate.roundedCornerFlatCharge, "ACM rounded-corner charge", 0, 100_000),
        contourMultiplier: finite(candidate.contourMultiplier, "ACM contour multiplier", 0, 20),
        sheetWidth: finite(candidate.sheetWidth, "ACM sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "ACM sheet height", 1, 1_000),
        shipping,
    };
}
function parseVinyl(value) {
    const candidate = object(value, "Vinyl pricing");
    if (candidate.kind !== "vinyl" || !Array.isArray(candidate.materials) || (candidate.materials.length < 4 || candidate.materials.length > 6))
        throw new Error("Vinyl material pricing is incomplete.");
    const sourceMaterials = candidate.materials.map(entry => object(entry, "Vinyl material"));
    if (new Set(sourceMaterials.map(entry => entry.key)).size !== sourceMaterials.length || sourceMaterials.some(entry => !VINYL_STRUCTURED_DEFAULTS.materials.some(row => row.key === entry.key)))
        throw new Error("Unknown or duplicate Vinyl material.");
    const materials = VINYL_STRUCTURED_DEFAULTS.materials.map((expected) => {
        const material = sourceMaterials.find(entry => entry.key === expected.key) ?? (["premium", "footprints"].includes(expected.key) ? expected : {});
        if (material.key !== expected.key)
            throw new Error("Vinyl material order or identity changed unexpectedly.");
        return {
            key: expected.key,
            label: expected.label,
            engineMaterial: expected.engineMaterial,
            costPerSqFt: finite(material.costPerSqFt, `${expected.key} cost`, 0, 10_000),
            retailPerSqFt: finite(material.retailPerSqFt, `${expected.key} retail`, 0, 100_000),
        };
    });
    return {
        kind: "vinyl",
        materials,
        marginPercent: finite(candidate.marginPercent, "Vinyl margin target", 0, 95),
        contourMultiplier: finite(candidate.contourMultiplier, "Vinyl contour multiplier", 0, 20),
        contourPaddingInches: finite(candidate.contourPaddingInches, "Vinyl contour padding", 0, 100),
        gangWastePercent: finite(candidate.gangWastePercent, "Vinyl gang waste", 0, 1_000),
        rollWidthInches: finite(candidate.rollWidthInches, "Vinyl roll width", 1, 1_000),
        rushMultiplier: finite(candidate.rushMultiplier, "Vinyl rush multiplier", 0, 20),
        standardShippingCost: finite(candidate.standardShippingCost, "Vinyl standard freight", 0, 100_000),
        bulkShippingCost: finite(candidate.bulkShippingCost, "Vinyl bulk freight", 0, 100_000),
        bulkShippingSqFtThreshold: finite(candidate.bulkShippingSqFtThreshold, "Vinyl bulk freight threshold", 1, 1_000_000),
    };
}
function parseCustomCoroplast(value) {
    const candidate = object(value, "Custom-Cut Coroplast pricing");
    if (candidate.kind !== "custom-cut-coroplast" || !Array.isArray(candidate.sheetCostTiers) || candidate.sheetCostTiers.length !== 3 || !Array.isArray(candidate.handlingTiers) || candidate.handlingTiers.length !== 3)
        throw new Error("Custom-Cut Coroplast pricing tiers are incomplete.");
    const sheetCostTiers = candidate.sheetCostTiers.map((entry, index) => {
        const tier = object(entry, "Custom-Cut Coroplast sheet tier");
        return {
            maximumSheets: index === 2 ? null : finite(tier.maximumSheets, `Coroplast sheet threshold ${index + 1}`, 1, 1_000_000),
            singleSidedPerSheet: finite(tier.singleSidedPerSheet, `Coroplast single-sided sheet cost ${index + 1}`, 0, 100_000),
            doubleSidedPerSheet: finite(tier.doubleSidedPerSheet, `Coroplast double-sided sheet cost ${index + 1}`, 0, 100_000),
        };
    });
    if (Number(sheetCostTiers[1].maximumSheets) <= Number(sheetCostTiers[0].maximumSheets))
        throw new Error("Coroplast sheet thresholds must increase.");
    const handlingTiers = candidate.handlingTiers.map((entry, index) => {
        const tier = object(entry, "Custom-Cut Coroplast handling tier");
        return {
            maximumQuantity: index === 2 ? null : finite(tier.maximumQuantity, `Coroplast handling threshold ${index + 1}`, 1, 1_000_000),
            perPiece: finite(tier.perPiece, `Coroplast handling fee ${index + 1}`, 0, 100_000),
        };
    });
    if (Number(handlingTiers[1].maximumQuantity) <= Number(handlingTiers[0].maximumQuantity))
        throw new Error("Coroplast handling thresholds must increase.");
    return {
        kind: "custom-cut-coroplast",
        sheetWidth: finite(candidate.sheetWidth, "Coroplast sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "Coroplast sheet height", 1, 1_000),
        marginPercent: finite(candidate.marginPercent, "Coroplast margin target", 0, 95),
        sheetCostTiers,
        handlingTiers,
        standardStakeRetailEach: finite(candidate.standardStakeRetailEach, "Coroplast standard stake retail", 0, 10_000),
        standardStakeCostEach: finite(candidate.standardStakeCostEach, "Coroplast standard stake cost", 0, 10_000),
        heavyStakeUpchargeEach: finite(candidate.heavyStakeUpchargeEach, "Coroplast heavy stake upcharge", 0, 10_000),
        grommetEach: finite(candidate.grommetEach, "Coroplast grommet charge", 0, 10_000),
        grommetSetup: finite(candidate.grommetSetup, "Coroplast grommet setup", 0, 100_000),
        glossEach: finite(candidate.glossEach, "Coroplast gloss charge", 0, 10_000),
        contourMultiplier: finite(candidate.contourMultiplier, "Coroplast contour multiplier", 0, 20),
        rushMultiplier: finite(candidate.rushMultiplier, "Coroplast rush multiplier", 0, 20),
        shipping: parseSheetShipping(candidate.shipping),
    };
}
function parseVehicleMagnet(value) {
    const candidate = object(value, "Vehicle Magnet pricing");
    if (candidate.kind !== "vehicle-magnet")
        throw new Error("Vehicle Magnet pricing is invalid.");
    const presetValues = candidate.standardPresetCosts ? object(candidate.standardPresetCosts, "Standard magnet costs") : VEHICLE_MAGNET_STRUCTURED_DEFAULTS.standardPresetCosts;
    return {
        standardPresetCosts: Object.fromEntries(Object.keys(VEHICLE_MAGNET_STRUCTURED_DEFAULTS.standardPresetCosts).map(key => [key, finite(presetValues[key], key + " magnet cost", 0, 100000)])),
        standardShippingGroupSize: finite(candidate.standardShippingGroupSize ?? 10, "Magnet shipping group size", 1, 10000),
        standardBulkQuantity: finite(candidate.standardBulkQuantity ?? 191, "Magnet bulk quantity", 1, 100000),
        kind: "vehicle-magnet",
        costPerSqIn: finite(candidate.costPerSqIn, "Vehicle Magnet square-inch cost", 0, 10_000),
        marginPercent: finite(candidate.marginPercent, "Vehicle Magnet margin target", 0, 95),
        contourMultiplier: finite(candidate.contourMultiplier, "Vehicle Magnet contour multiplier", 0, 20),
        rushMultiplier: finite(candidate.rushMultiplier, "Vehicle Magnet rush multiplier", 0, 20),
        standardShippingCost: finite(candidate.standardShippingCost, "Vehicle Magnet standard freight", 0, 100_000),
        bulkShippingCost: finite(candidate.bulkShippingCost, "Vehicle Magnet bulk freight", 0, 100_000),
        bulkShippingSqInThreshold: finite(candidate.bulkShippingSqInThreshold, "Vehicle Magnet bulk freight threshold", 1, 100_000_000),
    };
}
function parseAreaCostTiers(value, expectedLength, label) {
    if (!Array.isArray(value) || value.length !== expectedLength)
        throw new Error(`${label} supplier tiers are incomplete.`);
    const tiers = value.map((entry, index) => {
        const tier = object(entry, `${label} supplier tier`);
        return {
            minimumSqFt: finite(tier.minimumSqFt, `${label} square-foot threshold ${index + 1}`, 0, 100_000_000),
            costPerSqFt: finite(tier.costPerSqFt, `${label} supplier cost ${index + 1}`, 0, 100_000),
        };
    });
    if (tiers[0].minimumSqFt !== 0 || tiers.some((tier, index) => index > 0 && tier.minimumSqFt <= tiers[index - 1].minimumSqFt))
        throw new Error(`${label} square-foot thresholds must start at zero and increase.`);
    return tiers;
}
function parseMeshBanner(value) {
    const candidate = object(value, "Mesh Banner pricing");
    if (candidate.kind !== "mesh-banner")
        throw new Error("Mesh Banner pricing is invalid.");
    return {
        kind: "mesh-banner",
        marginPercent: finite(candidate.marginPercent, "Mesh Banner margin target", 0, 95),
        supplierRateTiers: parseAreaCostTiers(candidate.supplierRateTiers, MESH_BANNER_STRUCTURED_DEFAULTS.supplierRateTiers.length, "Mesh Banner"),
        polePocketPerPerimeterFt: finite(candidate.polePocketPerPerimeterFt, "Mesh Banner pole-pocket perimeter rate", 0, 10_000),
        polePocketSetup: finite(candidate.polePocketSetup, "Mesh Banner pole-pocket setup", 0, 100_000),
        ropePerPerimeterFt: finite(candidate.ropePerPerimeterFt, "Mesh Banner rope perimeter rate", 0, 10_000),
        webbingPerPerimeterFt: finite(candidate.webbingPerPerimeterFt, "Mesh Banner webbing perimeter rate", 0, 10_000),
        rushMultiplier: finite(candidate.rushMultiplier, "Mesh Banner rush multiplier", 0, 20),
        standardShippingCost: finite(candidate.standardShippingCost, "Mesh Banner standard freight", 0, 100_000),
        bulkShippingCost: finite(candidate.bulkShippingCost, "Mesh Banner bulk freight", 0, 100_000),
        bulkShippingSqFtThreshold: finite(candidate.bulkShippingSqFtThreshold, "Mesh Banner bulk freight threshold", 1, 100_000_000),
        oversizedWidthInches: finite(candidate.oversizedWidthInches, "Mesh Banner oversized width", 1, 100_000),
        oversizedHeightInches: finite(candidate.oversizedHeightInches, "Mesh Banner oversized height", 1, 100_000),
    };
}
function parsePoster(value) {
    const candidate = object(value, "Poster pricing");
    if (candidate.kind !== "poster")
        throw new Error("Poster pricing is invalid.");
    return {
        kind: "poster",
        marginPercent: finite(candidate.marginPercent, "Poster margin target", 0, 95),
        supplierRateTiers: parseAreaCostTiers(candidate.supplierRateTiers, POSTER_STRUCTURED_DEFAULTS.supplierRateTiers.length, "Poster"),
        rushMultiplier: finite(candidate.rushMultiplier, "Poster rush multiplier", 0, 20),
        standardShippingCost: finite(candidate.standardShippingCost, "Poster standard freight", 0, 100_000),
        bulkShippingCost: finite(candidate.bulkShippingCost, "Poster bulk freight", 0, 100_000),
        bulkShippingSqFtThreshold: finite(candidate.bulkShippingSqFtThreshold, "Poster bulk freight threshold", 1, 100_000_000),
        oversizedDimensionInches: finite(candidate.oversizedDimensionInches, "Poster oversized dimension", 1, 100_000),
    };
}
function parseAcrylic(value) {
    const candidate = object(value, "Acrylic pricing");
    if (candidate.kind !== "acrylic" || !Array.isArray(candidate.standOffRates) || candidate.standOffRates.length !== ACRYLIC_STRUCTURED_DEFAULTS.standOffRates.length)
        throw new Error("Acrylic pricing is incomplete.");
    const standOffRates = candidate.standOffRates.map((entry, index) => {
        const rate = object(entry, "Acrylic stand-off rate");
        const expected = ACRYLIC_STRUCTURED_DEFAULTS.standOffRates[index];
        if (rate.key !== expected.key)
            throw new Error("Acrylic stand-off order or identity changed unexpectedly.");
        return {
            key: expected.key,
            label: expected.label,
            directEach: finite(rate.directEach, `${expected.label} stand-off direct cost`, 0, 10_000),
            retailEach: finite(rate.retailEach, `${expected.label} stand-off retail`, 0, 10_000),
        };
    });
    return {
        kind: "acrylic",
        costPerSqIn: finite(candidate.costPerSqIn, "Acrylic square-inch cost", 0, 10_000),
        minimumCostEach: finite(candidate.minimumCostEach, "Acrylic minimum cost", 0, 100_000),
        marginPercent: finite(candidate.marginPercent, "Acrylic margin target", 0, 95),
        roundedCornerFlatCharge: finite(candidate.roundedCornerFlatCharge, "Acrylic rounded-corner charge", 0, 100_000),
        contourMultiplier: finite(candidate.contourMultiplier, "Acrylic contour multiplier", 0, 20),
        sheetWidth: finite(candidate.sheetWidth, "Acrylic sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "Acrylic sheet height", 1, 1_000),
        standOffRates,
        shipping: parseSheetShipping(candidate.shipping),
    };
}
function parseFoamcore(value) {
    const candidate = object(value, "Foamcore pricing");
    if (candidate.kind !== "foamcore" || !Array.isArray(candidate.sheetCostTiers) || candidate.sheetCostTiers.length !== FOAMCORE_STRUCTURED_DEFAULTS.sheetCostTiers.length)
        throw new Error("Foamcore sheet pricing is incomplete.");
    if (!Array.isArray(candidate.handlingTiers) || candidate.handlingTiers.length !== FOAMCORE_STRUCTURED_DEFAULTS.handlingTiers.length)
        throw new Error("Foamcore handling pricing is incomplete.");
    const sheetCostTiers = candidate.sheetCostTiers.map((entry, index) => {
        const tier = object(entry, "Foamcore sheet tier");
        return {
            maximumSheets: index === FOAMCORE_STRUCTURED_DEFAULTS.sheetCostTiers.length - 1 ? null : finite(tier.maximumSheets, `Foamcore sheet threshold ${index + 1}`, 1, 1_000_000),
            singleSidedPerSheet: finite(tier.singleSidedPerSheet, `Foamcore single-sided sheet ${index + 1}`, 0, 100_000),
            doubleSidedPerSheet: finite(tier.doubleSidedPerSheet, `Foamcore double-sided sheet ${index + 1}`, 0, 100_000),
        };
    });
    const handlingTiers = candidate.handlingTiers.map((entry, index) => {
        const tier = object(entry, "Foamcore handling tier");
        return {
            maximumQuantity: index === FOAMCORE_STRUCTURED_DEFAULTS.handlingTiers.length - 1 ? null : finite(tier.maximumQuantity, `Foamcore handling threshold ${index + 1}`, 1, 1_000_000),
            perPiece: finite(tier.perPiece, `Foamcore handling rate ${index + 1}`, 0, 100_000),
        };
    });
    if (Number(sheetCostTiers[1].maximumSheets) <= Number(sheetCostTiers[0].maximumSheets))
        throw new Error("Foamcore sheet thresholds must increase.");
    if (Number(handlingTiers[1].maximumQuantity) <= Number(handlingTiers[0].maximumQuantity))
        throw new Error("Foamcore handling thresholds must increase.");
    return {
        kind: "foamcore",
        sheetWidth: finite(candidate.sheetWidth, "Foamcore sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "Foamcore sheet height", 1, 1_000),
        marginPercent: finite(candidate.marginPercent, "Foamcore margin target", 0, 95),
        sheetCostTiers,
        handlingTiers,
        glossEach: finite(candidate.glossEach, "Foamcore gloss charge", 0, 10_000),
        contourMultiplier: finite(candidate.contourMultiplier, "Foamcore contour multiplier", 0, 20),
        rushMultiplier: finite(candidate.rushMultiplier, "Foamcore rush multiplier", 0, 20),
        shipping: parseSheetShipping(candidate.shipping),
    };
}
function parsePvc(value) {
    const candidate = object(value, "PVC pricing");
    if (candidate.kind !== "pvc" || !Array.isArray(candidate.materials) || candidate.materials.length !== PVC_STRUCTURED_DEFAULTS.materials.length)
        throw new Error("PVC material pricing is incomplete.");
    if (!Array.isArray(candidate.handlingTiers) || candidate.handlingTiers.length !== PVC_STRUCTURED_DEFAULTS.handlingTiers.length)
        throw new Error("PVC handling pricing is incomplete.");
    const materials = candidate.materials.map((entry, materialIndex) => {
        const material = object(entry, "PVC material");
        const expected = PVC_STRUCTURED_DEFAULTS.materials[materialIndex];
        if (material.key !== expected.key || !Array.isArray(material.sheetCostTiers) || material.sheetCostTiers.length !== expected.sheetCostTiers.length)
            throw new Error("PVC material order, identity, or tiers changed unexpectedly.");
        const sheetCostTiers = material.sheetCostTiers.map((tierEntry, tierIndex) => {
            const tier = object(tierEntry, "PVC sheet tier");
            return {
                maximumSheets: tierIndex === expected.sheetCostTiers.length - 1 ? null : finite(tier.maximumSheets, `${expected.label} sheet threshold ${tierIndex + 1}`, 1, 1_000_000),
                perSheet: finite(tier.perSheet, `${expected.label} sheet cost ${tierIndex + 1}`, 0, 100_000),
            };
        });
        if (Number(sheetCostTiers[1].maximumSheets) <= Number(sheetCostTiers[0].maximumSheets))
            throw new Error(`${expected.label} sheet thresholds must increase.`);
        return { key: expected.key, label: expected.label, sheetCostTiers };
    });
    const handlingTiers = candidate.handlingTiers.map((entry, index) => {
        const tier = object(entry, "PVC handling tier");
        return {
            maximumQuantity: index === PVC_STRUCTURED_DEFAULTS.handlingTiers.length - 1 ? null : finite(tier.maximumQuantity, `PVC handling threshold ${index + 1}`, 1, 1_000_000),
            perPiece: finite(tier.perPiece, `PVC handling rate ${index + 1}`, 0, 100_000),
        };
    });
    if (Number(handlingTiers[1].maximumQuantity) <= Number(handlingTiers[0].maximumQuantity))
        throw new Error("PVC handling thresholds must increase.");
    return {
        kind: "pvc",
        sheetWidth: finite(candidate.sheetWidth, "PVC sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "PVC sheet height", 1, 1_000),
        marginPercent: finite(candidate.marginPercent, "PVC margin target", 0, 95),
        materials,
        handlingTiers,
        contourMultiplier: finite(candidate.contourMultiplier, "PVC contour multiplier", 0, 20),
        rushMultiplier: finite(candidate.rushMultiplier, "PVC rush multiplier", 0, 20),
        shipping: parseSheetShipping(candidate.shipping),
    };
}
function parsePolystyrene(value) {
    const candidate = object(value, "Polystyrene pricing");
    if (candidate.kind !== "polystyrene" || !Array.isArray(candidate.sheetCostTiers) || candidate.sheetCostTiers.length !== POLYSTYRENE_STRUCTURED_DEFAULTS.sheetCostTiers.length)
        throw new Error("Polystyrene sheet pricing is incomplete.");
    if (!Array.isArray(candidate.handlingTiers) || candidate.handlingTiers.length !== POLYSTYRENE_STRUCTURED_DEFAULTS.handlingTiers.length)
        throw new Error("Polystyrene handling pricing is incomplete.");
    const sheetCostTiers = candidate.sheetCostTiers.map((entry, index) => {
        const tier = object(entry, "Polystyrene sheet tier");
        return {
            maximumSheets: index === POLYSTYRENE_STRUCTURED_DEFAULTS.sheetCostTiers.length - 1 ? null : finite(tier.maximumSheets, `Polystyrene sheet threshold ${index + 1}`, 1, 1_000_000),
            singleSidedPerSheet: finite(tier.singleSidedPerSheet, `Polystyrene single-sided sheet ${index + 1}`, 0, 100_000),
            doubleSidedPerSheet: finite(tier.doubleSidedPerSheet, `Polystyrene double-sided sheet ${index + 1}`, 0, 100_000),
        };
    });
    const handlingTiers = candidate.handlingTiers.map((entry, index) => {
        const tier = object(entry, "Polystyrene handling tier");
        return {
            maximumQuantity: index === POLYSTYRENE_STRUCTURED_DEFAULTS.handlingTiers.length - 1 ? null : finite(tier.maximumQuantity, `Polystyrene handling threshold ${index + 1}`, 1, 1_000_000),
            perPiece: finite(tier.perPiece, `Polystyrene handling rate ${index + 1}`, 0, 100_000),
        };
    });
    if (Number(sheetCostTiers[1].maximumSheets) <= Number(sheetCostTiers[0].maximumSheets))
        throw new Error("Polystyrene sheet thresholds must increase.");
    if (Number(handlingTiers[1].maximumQuantity) <= Number(handlingTiers[0].maximumQuantity))
        throw new Error("Polystyrene handling thresholds must increase.");
    return {
        kind: "polystyrene",
        sheetWidth: finite(candidate.sheetWidth, "Polystyrene sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "Polystyrene sheet height", 1, 1_000),
        marginPercent: finite(candidate.marginPercent, "Polystyrene margin target", 0, 95),
        sheetCostTiers,
        handlingTiers,
        glossDirectCostEach: finite(candidate.glossDirectCostEach, "Polystyrene gloss direct cost", 0, 10_000),
        contourMultiplier: finite(candidate.contourMultiplier, "Polystyrene contour multiplier", 0, 20),
        rushMultiplier: finite(candidate.rushMultiplier, "Polystyrene rush multiplier", 0, 20),
        shipping: parseSheetShipping(candidate.shipping),
    };
}
function parseAluminum(value) {
    const candidate = object(value, "Aluminum pricing");
    if (candidate.kind !== "aluminum" || !Array.isArray(candidate.materials) || candidate.materials.length !== ALUMINUM_STRUCTURED_DEFAULTS.materials.length)
        throw new Error("Aluminum material pricing is incomplete.");
    const materials = candidate.materials.map((entry, materialIndex) => {
        const material = object(entry, "Aluminum material");
        const expected = ALUMINUM_STRUCTURED_DEFAULTS.materials[materialIndex];
        if (material.key !== expected.key || !Array.isArray(material.sheetCostTiers) || material.sheetCostTiers.length !== expected.sheetCostTiers.length)
            throw new Error("Aluminum material order, identity, or sheet tiers changed unexpectedly.");
        const sheetCostTiers = material.sheetCostTiers.map((tierEntry, tierIndex) => {
            const tier = object(tierEntry, "Aluminum sheet tier");
            return {
                maximumSheets: tierIndex === expected.sheetCostTiers.length - 1 ? null : finite(tier.maximumSheets, `${expected.label} sheet threshold ${tierIndex + 1}`, 1, 1_000_000),
                perSheet: finite(tier.perSheet, `${expected.label} sheet cost ${tierIndex + 1}`, 0, 100_000),
            };
        });
        if (Number(sheetCostTiers[1].maximumSheets) <= Number(sheetCostTiers[0].maximumSheets))
            throw new Error(`${expected.label} sheet thresholds must increase.`);
        return {
            key: expected.key,
            label: expected.label,
            costPerSqIn: finite(material.costPerSqIn, `${expected.label} square-inch cost`, 0, 10_000),
            minimumCostEach: finite(material.minimumCostEach, `${expected.label} minimum cost`, 0, 100_000),
            sheetCostTiers,
        };
    });
    return {
        kind: "aluminum",
        sheetWidth: finite(candidate.sheetWidth, "Aluminum sheet width", 1, 1_000),
        sheetHeight: finite(candidate.sheetHeight, "Aluminum sheet height", 1, 1_000),
        marginPercent: finite(candidate.marginPercent, "Aluminum margin target", 0, 95),
        materials,
        contourMultiplier: finite(candidate.contourMultiplier, "Aluminum contour multiplier", 0, 20),
        roundedCornerSqInDirectFee: finite(candidate.roundedCornerSqInDirectFee, "Aluminum square-inch rounded-corner direct fee", 0, 100_000),
        roundedCornerSheetDirectFee: finite(candidate.roundedCornerSheetDirectFee, "Aluminum full-sheet rounded-corner direct fee", 0, 100_000),
        roundedCornerRetailFee: finite(candidate.roundedCornerRetailFee, "Aluminum rounded-corner retail fee", 0, 100_000),
        roundedCornerOptimizedRetailFee: finite(candidate.roundedCornerOptimizedRetailFee, "Aluminum optimized rounded-corner retail fee", 0, 100_000),
        shipping: parseSheetShipping(candidate.shipping),
    };
}
function parseBusinessCard(value) {
    const candidate = object(value, "Business card pricing");
    if (candidate.kind !== "business-card" || !Array.isArray(candidate.priceTiers) || candidate.priceTiers.length !== BUSINESS_CARD_STRUCTURED_DEFAULTS.priceTiers.length)
        throw new Error("Business card pricing table is incomplete.");
    const priceTiers = candidate.priceTiers.map((entry, index) => {
        const tier = object(entry, "Business card price tier");
        const expected = BUSINESS_CARD_STRUCTURED_DEFAULTS.priceTiers[index];
        if (Number(tier.quantity) !== expected.quantity)
            throw new Error("Business card quantities or their order changed unexpectedly.");
        return {
            quantity: expected.quantity,
            singleSidedTotal: finite(tier.singleSidedTotal, `${expected.quantity} single-sided total`, 0, 100_000),
            doubleSidedTotal: finite(tier.doubleSidedTotal, `${expected.quantity} double-sided total`, 0, 100_000),
        };
    });
    return {
        kind: "business-card",
        priceTiers,
        rushMultiplier: finite(candidate.rushMultiplier, "Business card rush multiplier", 0, 20),
        freightDirectCost: finite(candidate.freightDirectCost, "Business card freight direct cost", 0, 100_000),
    };
}
function parseHandheldPaper(value) {
    const candidate = object(value, "Handheld paper pricing");
    if (candidate.kind !== "handheld-paper" || !Array.isArray(candidate.sizes) || candidate.sizes.length !== HANDHELD_PAPER_STRUCTURED_DEFAULTS.sizes.length)
        throw new Error("Handheld paper size table is incomplete.");
    if (!Array.isArray(candidate.areaRateTiers) || candidate.areaRateTiers.length !== HANDHELD_PAPER_STRUCTURED_DEFAULTS.areaRateTiers.length)
        throw new Error("Handheld paper area-rate tiers are incomplete.");
    const sizes = candidate.sizes.map((entry, index) => {
        const size = object(entry, "Handheld paper size");
        const expected = HANDHELD_PAPER_STRUCTURED_DEFAULTS.sizes[index];
        if (size.key !== expected.key)
            throw new Error("Handheld paper size order or identity changed unexpectedly.");
        return {
            key: expected.key,
            label: expected.label,
            width: finite(size.width, `${expected.label} width`, 0.01, 1_000),
            height: finite(size.height, `${expected.label} height`, 0.01, 1_000),
            piecesPerSheet: finite(size.piecesPerSheet, `${expected.label} pieces per sheet`, 1, 1_000_000),
        };
    });
    const areaRateTiers = candidate.areaRateTiers.map((entry, index) => {
        const tier = object(entry, "Handheld paper area-rate tier");
        return {
            minimumQuantity: finite(tier.minimumQuantity, `Handheld area-rate threshold ${index + 1}`, 1, 1_000_000),
            referenceQuantity: finite(tier.referenceQuantity, `Handheld reference quantity ${index + 1}`, 1, 1_000_000),
            referenceTotal: finite(tier.referenceTotal, `Handheld reference total ${index + 1}`, 0, 100_000),
        };
    });
    if (areaRateTiers.some((tier, index) => index > 0 && tier.minimumQuantity <= areaRateTiers[index - 1].minimumQuantity))
        throw new Error("Handheld area-rate thresholds must increase.");
    return {
        kind: "handheld-paper",
        sizes,
        areaRateTiers,
        referenceAreaSqIn: finite(candidate.referenceAreaSqIn, "Handheld reference area", 0.01, 1_000_000),
        materialCostPerSheet: finite(candidate.materialCostPerSheet, "Handheld material cost per sheet", 0, 100_000),
        marginPercent: finite(candidate.marginPercent, "Handheld margin target", 0, 95),
        rushMultiplier: finite(candidate.rushMultiplier, "Handheld rush multiplier", 0, 20),
        freightSheetGroupSize: finite(candidate.freightSheetGroupSize, "Handheld freight sheet group", 1, 1_000_000),
        freightPerGroup: finite(candidate.freightPerGroup, "Handheld freight per group", 0, 100_000),
    };
}
function parseCarbonless(value) {
    const candidate = object(value, "Carbonless pricing");
    if (candidate.kind !== "carbonless" || !Array.isArray(candidate.costGroups) || candidate.costGroups.length !== CARBONLESS_STRUCTURED_DEFAULTS.costGroups.length)
        throw new Error("Carbonless cost table is incomplete.");
    if (!Array.isArray(candidate.numberingTiers) || candidate.numberingTiers.length !== CARBONLESS_STRUCTURED_DEFAULTS.numberingTiers.length)
        throw new Error("Carbonless numbering tiers are incomplete.");
    const costGroups = candidate.costGroups.map((entry, groupIndex) => {
        const group = object(entry, "Carbonless cost group");
        const expected = CARBONLESS_STRUCTURED_DEFAULTS.costGroups[groupIndex];
        if (group.size !== expected.size || group.formType !== expected.formType || !Array.isArray(group.costs) || group.costs.length !== expected.costs.length)
            throw new Error("Carbonless size, form type, or quantity rows changed unexpectedly.");
        const costs = group.costs.map((costEntry, costIndex) => {
            const cost = object(costEntry, "Carbonless cost point");
            const expectedCost = expected.costs[costIndex];
            if (Number(cost.quantity) !== expectedCost.quantity)
                throw new Error("Carbonless quantities or their order changed unexpectedly.");
            return {
                quantity: expectedCost.quantity,
                blackInk: finite(cost.blackInk, `${expected.size} ${expected.formType} black cost at ${expectedCost.quantity}`, 0, 1_000_000),
                fullColor: cost.fullColor === null ? null : finite(cost.fullColor, `${expected.size} ${expected.formType} full-color cost at ${expectedCost.quantity}`, 0, 1_000_000),
            };
        });
        return { size: expected.size, formType: expected.formType, costs };
    });
    const numberingTiers = candidate.numberingTiers.map((entry, index) => {
        const tier = object(entry, "Carbonless numbering tier");
        return {
            minimumQuantity: finite(tier.minimumQuantity, `Carbonless numbering threshold ${index + 1}`, 1, 1_000_000),
            flatCost: finite(tier.flatCost, `Carbonless numbering cost ${index + 1}`, 0, 100_000),
        };
    });
    if (numberingTiers.some((tier, index) => index > 0 && tier.minimumQuantity <= numberingTiers[index - 1].minimumQuantity))
        throw new Error("Carbonless numbering thresholds must increase.");
    return {
        kind: "carbonless",
        costGroups,
        fullColorFallbackMultiplier: finite(candidate.fullColorFallbackMultiplier, "Carbonless full-color fallback multiplier", 0, 20),
        frontBackMultiplier: finite(candidate.frontBackMultiplier, "Carbonless front/back multiplier", 0, 20),
        numberingTiers,
        wraparoundFlatCost: finite(candidate.wraparoundFlatCost, "Carbonless wraparound cost", 0, 100_000),
        bookedSetsFlatCost: finite(candidate.bookedSetsFlatCost, "Carbonless booked-sets cost", 0, 100_000),
        retailMultiplier: finite(candidate.retailMultiplier, "Carbonless retail multiplier", 0, 20),
        rushMultiplier: finite(candidate.rushMultiplier, "Carbonless rush multiplier", 0, 20),
    };
}
function parseDoorHanger(value) {
    const candidate = object(value, "Door Hanger pricing");
    if (candidate.kind !== "door-hanger")
        throw new Error("Door Hanger pricing is invalid.");
    const parseOptionRates = (value, expected, label) => {
        if (!Array.isArray(value) || value.length !== expected.length)
            throw new Error(`${label} options are incomplete.`);
        return value.map((entry, index) => {
            const option = object(entry, label);
            if (option.key !== expected[index].key)
                throw new Error(`${label} option order or identity changed unexpectedly.`);
            return { key: expected[index].key, multiplier: finite(option.multiplier, `${label} ${expected[index].key} multiplier`, 0, 20) };
        });
    };
    if (!Array.isArray(candidate.sizes) || candidate.sizes.length !== DOOR_HANGER_STRUCTURED_DEFAULTS.sizes.length)
        throw new Error("Door Hanger sizes are incomplete.");
    const sizes = candidate.sizes.map((entry, index) => {
        const size = object(entry, "Door Hanger size");
        const expected = DOOR_HANGER_STRUCTURED_DEFAULTS.sizes[index];
        if (size.key !== expected.key)
            throw new Error("Door Hanger size order or identity changed unexpectedly.");
        return { key: expected.key, areaSqIn: finite(size.areaSqIn, `${expected.key} area`, 0.01, 10_000) };
    });
    return {
        kind: "door-hanger",
        sizes,
        referenceQuantity: finite(candidate.referenceQuantity, "Door Hanger reference quantity", 1, 1_000_000),
        referenceDirectCost: finite(candidate.referenceDirectCost, "Door Hanger reference direct cost", 0, 1_000_000),
        frontInkMultipliers: parseOptionRates(candidate.frontInkMultipliers, DOOR_HANGER_STRUCTURED_DEFAULTS.frontInkMultipliers, "Door Hanger front ink"),
        backPrintingMultipliers: parseOptionRates(candidate.backPrintingMultipliers, DOOR_HANGER_STRUCTURED_DEFAULTS.backPrintingMultipliers, "Door Hanger back printing"),
        perforationMultiplierPerCount: finite(candidate.perforationMultiplierPerCount, "Door Hanger perforation multiplier per count", 0, 20),
        shrinkWrapMultipliers: parseOptionRates(candidate.shrinkWrapMultipliers, DOOR_HANGER_STRUCTURED_DEFAULTS.shrinkWrapMultipliers, "Door Hanger shrink wrap"),
        marginPercent: finite(candidate.marginPercent, "Door Hanger margin target", 0, 95),
    };
}
export function structuredPricingDefaults(productKey) {
    if (productKey === "banner")
        return structuredClone(BANNER_STRUCTURED_DEFAULTS);
    if (productKey === "yard-sign")
        return structuredClone(YARD_SIGN_STRUCTURED_DEFAULTS);
    if (productKey === "acm")
        return structuredClone(ACM_STRUCTURED_DEFAULTS);
    if (productKey === "vinyl")
        return structuredClone(VINYL_STRUCTURED_DEFAULTS);
    if (productKey === "custom-cut-coroplast")
        return structuredClone(CUSTOM_COROPLAST_STRUCTURED_DEFAULTS);
    if (productKey === "vehicle-magnet")
        return structuredClone(VEHICLE_MAGNET_STRUCTURED_DEFAULTS);
    if (productKey === "mesh-banner")
        return structuredClone(MESH_BANNER_STRUCTURED_DEFAULTS);
    if (productKey === "poster")
        return structuredClone(POSTER_STRUCTURED_DEFAULTS);
    if (productKey === "acrylic")
        return structuredClone(ACRYLIC_STRUCTURED_DEFAULTS);
    if (productKey === "foamcore")
        return structuredClone(FOAMCORE_STRUCTURED_DEFAULTS);
    if (productKey === "pvc")
        return structuredClone(PVC_STRUCTURED_DEFAULTS);
    if (productKey === "polystyrene")
        return structuredClone(POLYSTYRENE_STRUCTURED_DEFAULTS);
    if (productKey === "aluminum")
        return structuredClone(ALUMINUM_STRUCTURED_DEFAULTS);
    if (productKey === "business-card")
        return structuredClone(BUSINESS_CARD_STRUCTURED_DEFAULTS);
    if (productKey === "handheld-paper")
        return structuredClone(HANDHELD_PAPER_STRUCTURED_DEFAULTS);
    if (productKey === "carbonless")
        return structuredClone(CARBONLESS_STRUCTURED_DEFAULTS);
    if (productKey === "door-hanger")
        return structuredClone(DOOR_HANGER_STRUCTURED_DEFAULTS);
    return null;
}
export function normalizeStructuredPricing(productKey, value) {
    const fallback = structuredPricingDefaults(productKey);
    if (!fallback)
        return null;
    try {
        if (productKey === "banner")
            return parseBanner(value);
        if (productKey === "yard-sign")
            return parseYardSign(value);
        if (productKey === "acm")
            return parseAcm(value);
        if (productKey === "vinyl")
            return parseVinyl(value);
        if (productKey === "custom-cut-coroplast")
            return parseCustomCoroplast(value);
        if (productKey === "vehicle-magnet")
            return parseVehicleMagnet(value);
        if (productKey === "mesh-banner")
            return parseMeshBanner(value);
        if (productKey === "poster")
            return parsePoster(value);
        if (productKey === "acrylic")
            return parseAcrylic(value);
        if (productKey === "foamcore")
            return parseFoamcore(value);
        if (productKey === "pvc")
            return parsePvc(value);
        if (productKey === "polystyrene")
            return parsePolystyrene(value);
        if (productKey === "aluminum")
            return parseAluminum(value);
        if (productKey === "business-card")
            return parseBusinessCard(value);
        if (productKey === "handheld-paper")
            return parseHandheldPaper(value);
        if (productKey === "carbonless")
            return parseCarbonless(value);
        return parseDoorHanger(value);
    }
    catch {
        return fallback;
    }
}
export function parseStructuredPricingJson(productKey, raw) {
    if (!structuredPricingDefaults(productKey))
        return null;
    let value;
    try {
        value = JSON.parse(raw);
    }
    catch {
        throw new Error("Structured pricing could not be read.");
    }
    if (productKey === "banner")
        return parseBanner(value);
    if (productKey === "yard-sign")
        return parseYardSign(value);
    if (productKey === "acm")
        return parseAcm(value);
    if (productKey === "vinyl")
        return parseVinyl(value);
    if (productKey === "custom-cut-coroplast")
        return parseCustomCoroplast(value);
    if (productKey === "vehicle-magnet")
        return parseVehicleMagnet(value);
    if (productKey === "mesh-banner")
        return parseMeshBanner(value);
    if (productKey === "poster")
        return parsePoster(value);
    if (productKey === "acrylic")
        return parseAcrylic(value);
    if (productKey === "foamcore")
        return parseFoamcore(value);
    if (productKey === "pvc")
        return parsePvc(value);
    if (productKey === "polystyrene")
        return parsePolystyrene(value);
    if (productKey === "aluminum")
        return parseAluminum(value);
    if (productKey === "business-card")
        return parseBusinessCard(value);
    if (productKey === "handheld-paper")
        return parseHandheldPaper(value);
    if (productKey === "carbonless")
        return parseCarbonless(value);
    return parseDoorHanger(value);
}
export function calculateBannerPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0);
    const height = Math.max(Number(scenario.height) || 0, 0);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const material = config.materials.find((entry) => entry.key === scenario.material) ?? config.materials[0];
    const sqFtEach = width * height / 144;
    const totalSqFt = sqFtEach * quantity;
    const perimeterFt = (width * 2 + height * 2) / 12;
    const materialCost = totalSqFt * material.costPerSqFt;
    let retail = totalSqFt * material.retailPerSqFt;
    if (scenario.polePocket)
        retail += perimeterFt * quantity * config.polePocketPerPerimeterFt + config.polePocketSetup;
    if (scenario.rope)
        retail += perimeterFt * quantity * config.ropePerPerimeterFt;
    if (scenario.windSlits)
        retail += totalSqFt * config.windSlitPerSqFt;
    if (scenario.rush)
        retail *= config.rushMultiplier;
    const shippingCost = totalSqFt >= config.bulkShippingSqFtThreshold ? config.bulkShippingCost : config.standardShippingCost;
    return {
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${totalSqFt.toFixed(2)} sq ft × $${material.retailPerSqFt.toFixed(2)} retail rate${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}`,
    };
}
function yardSignSheetCount(config, quantity) {
    const normal = Math.max(Math.floor(config.sheetWidth / config.width), 0) * Math.max(Math.floor(config.sheetHeight / config.height), 0);
    const rotated = Math.max(Math.floor(config.sheetWidth / config.height), 0) * Math.max(Math.floor(config.sheetHeight / config.width), 0);
    return Math.ceil(quantity / Math.max(normal, rotated, 1));
}
export function calculateYardSignPreview(config, scenario) {
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const quantityTier = config.quantityTiers.reduce((selected, tier) => quantity >= tier.minimumQuantity ? tier : selected, config.quantityTiers[0]);
    const tierEach = scenario.sides === "double" ? quantityTier.doubleSidedEach : quantityTier.singleSidedEach;
    const heavyStakeTotal = scenario.stakeType === "heavy-duty" ? quantity * config.heavyStakeUpchargeEach : 0;
    const tierPrice = quantity * tierEach + heavyStakeTotal;
    const sheets = yardSignSheetCount(config, quantity);
    const sheetTier = config.sheetCostTiers.find((tier) => tier.maximumSheets === null || sheets <= tier.maximumSheets) ?? config.sheetCostTiers[config.sheetCostTiers.length - 1];
    const sheetCost = scenario.sides === "double" ? sheetTier.doubleSidedPerSheet : sheetTier.singleSidedPerSheet;
    const materialCost = sheetCost * sheets;
    const shippingCost = sheets >= config.bulkShippingSheetThreshold ? config.bulkShippingCost : Math.ceil(sheets / config.shippingGroupSize) * config.shippingPerGroup;
    const marginPrice = materialCost / (1 - config.marginPercent / 100) + shippingCost;
    const standardStakeRetail = scenario.stakeType === "standard" ? quantity * config.standardStakeRetailEach : 0;
    const standardStakeCost = scenario.stakeType === "standard" ? quantity * config.standardStakeCostEach : 0;
    const basePrice = Math.max(tierPrice, marginPrice);
    const retail = basePrice + standardStakeRetail;
    return {
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost + standardStakeCost,
        materialCost,
        shippingCost,
        calculationBasis: tierPrice >= marginPrice ? `Quantity table ($${tierPrice.toFixed(2)})` : `${config.marginPercent}% margin floor ($${marginPrice.toFixed(2)})`,
    };
}
function sheetLayoutCount(width, height, quantity, sheetWidth, sheetHeight, allowRotate = true) {
    const normalAcross = Math.max(Math.floor(sheetWidth / width), 0);
    const normalDown = Math.max(Math.floor(sheetHeight / height), 0);
    const normalPerSheet = Math.max(normalAcross * normalDown, 1);
    const rotatedAcross = Math.max(Math.floor(sheetWidth / height), 0);
    const rotatedDown = Math.max(Math.floor(sheetHeight / width), 0);
    const rotatedPerSheet = Math.max(rotatedAcross * rotatedDown, 1);
    const rotated = allowRotate && rotatedPerSheet > normalPerSheet;
    const piecesPerSheet = rotated ? rotatedPerSheet : normalPerSheet;
    return {
        piecesPerSheet,
        sheetsRounded: Math.ceil(quantity / piecesPerSheet),
        across: rotated ? rotatedAcross : normalAcross,
        down: rotated ? rotatedDown : normalDown,
        rotated,
    };
}
function shippingBySize(config, width, height, sheets) {
    const longSide = Math.max(width, height);
    const shortSide = Math.min(width, height);
    const perGroup = (rate) => Math.ceil(sheets / config.groupSize) * rate;
    if (longSide <= config.smallMaxLongInches && shortSide <= config.smallMaxShortInches)
        return sheets >= config.smallBulkSheetThreshold ? config.oversizedCost : perGroup(config.smallPerGroupCost);
    if (longSide <= config.mediumMaxLongInches && shortSide <= config.mediumMaxShortInches)
        return sheets >= config.mediumBulkSheetThreshold ? config.oversizedCost : perGroup(config.mediumPerGroupCost);
    if (longSide <= config.mediumWideMaxLongInches && shortSide <= config.mediumWideMaxShortInches)
        return sheets >= config.mediumWideBulkSheetThreshold ? config.oversizedCost : perGroup(config.mediumWidePerGroupCost);
    if (longSide <= config.squareMaxInches && shortSide <= config.squareMaxInches) {
        if (sheets >= config.squareBulkSheetThreshold)
            return config.oversizedCost;
        if (sheets >= config.squareMidSheetThreshold)
            return config.squareMidCost;
        return config.squareBaseCost;
    }
    if ((longSide <= config.longMaxLongInches && shortSide <= config.longMaxShortInches)
        || (longSide <= config.extraLongMaxLongInches && shortSide <= config.extraLongMaxShortInches)) {
        return sheets >= config.longBulkSheetThreshold ? config.oversizedCost : config.longBaseCost;
    }
    return config.oversizedCost;
}
export function calculateAcmPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const material = config.materials.find((entry) => entry.key === scenario.material) ?? config.materials[0];
    const squareInchesEach = width * height;
    const totalSqFt = squareInchesEach * quantity / 144;
    const materialCost = Math.max(squareInchesEach * material.costPerSqIn, material.minimumCostEach) * quantity;
    const layout = sheetLayoutCount(width, height, quantity, config.sheetWidth, config.sheetHeight);
    const shippingCost = shippingBySize(config.shipping, width, height, layout.sheetsRounded);
    const cornerCharge = scenario.roundedCorners ? config.roundedCornerFlatCharge : 0;
    const marginPrice = materialCost / (1 - config.marginPercent / 100) + cornerCharge + shippingCost;
    const shopPrice = totalSqFt * config.shopRetailPerSqFt + cornerCharge;
    const winningPrice = Math.max(marginPrice, shopPrice);
    const retail = scenario.contourCut ? winningPrice * config.contourMultiplier : winningPrice;
    const basis = marginPrice >= shopPrice
        ? `${config.marginPercent}% margin floor ($${marginPrice.toFixed(2)})`
        : `Shop rate ($${shopPrice.toFixed(2)})`;
    return {
        breakdown: { sheetWidth: config.sheetWidth, sheetHeight: config.sheetHeight, piecesPerSheet: layout.piecesPerSheet, sheetsRounded: layout.sheetsRounded, sheetsUsed: quantity / layout.piecesPerSheet, sheetAcross: layout.across, sheetDown: layout.down, sheetRotated: layout.rotated, previewPieceW: layout.rotated ? height : width, previewPieceH: layout.rotated ? width : height, sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}` },
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${basis}${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""} · ${layout.across} across × ${layout.down} down${layout.rotated ? " rotated" : ""}`,
    };
}
function vinylLayout(width, height, quantity, rollWidth) {
    const piecesAcross = Math.max(Math.floor(rollWidth / width), 1);
    const rows = Math.ceil(quantity / piecesAcross);
    const roundedHeight = Math.ceil(rows * height / 12) * 12;
    return { piecesAcross, rows, roundedHeight, totalSqFt: rollWidth * roundedHeight / 144 };
}
function vinylBillableSqFt(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    if (!scenario.gangLayout) {
        const roundedHeight = Math.ceil(height / 12) * 12;
        return { geometry: {rollWidth: width, layoutHeight: roundedHeight, piecesAcross: 1, rows: 1, pieceW: width, pieceH: height, quantity: 1, repeat: quantity}, total: width * roundedHeight / 144 * quantity, basis: `Single-piece billing · ${width} × ${roundedHeight} in` };
    }
    const padding = scenario.contourCut ? config.contourPaddingInches * 2 : 0;
    const effectiveWidth = width + padding;
    const effectiveHeight = height + padding;
    const normal = vinylLayout(effectiveWidth, effectiveHeight, quantity, config.rollWidthInches);
    const rotated = vinylLayout(effectiveHeight, effectiveWidth, quantity, config.rollWidthInches);
    const best = normal.totalSqFt <= rotated.totalSqFt ? { ...normal, rotated: false } : { ...rotated, rotated: true };
    const wasteMultiplier = scenario.contourCut ? 1 + config.gangWastePercent / 100 : 1;
    return {
        geometry: {rollWidth: config.rollWidthInches, layoutHeight: best.roundedHeight, piecesAcross: best.piecesAcross, rows: best.rows, pieceW: best.rotated ? effectiveHeight : effectiveWidth, pieceH: best.rotated ? effectiveWidth : effectiveHeight, quantity, repeat: 1},
    total: Math.ceil(best.totalSqFt * wasteMultiplier),
        basis: `Ganged layout · ${best.piecesAcross} across × ${best.rows} rows${best.rotated ? " rotated" : ""}`,
    };
}
export function calculateVinylPreview(config, scenario) {
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const material = config.materials.find((entry) => entry.key === scenario.material) ?? config.materials[0];
    const layout = vinylBillableSqFt(config, scenario);
    const materialCost = layout.total * material.costPerSqFt;
    const shippingCost = layout.total >= config.bulkShippingSqFtThreshold ? config.bulkShippingCost : config.standardShippingCost;
    let shopPrice = layout.total * material.retailPerSqFt;
    let marginPrice = materialCost / (1 - config.marginPercent / 100);
    if (scenario.rush) {
        shopPrice *= config.rushMultiplier;
        marginPrice *= config.rushMultiplier;
    }
    marginPrice += shippingCost;
    const winningPrice = Math.max(shopPrice, marginPrice);
    const retail = scenario.contourCut ? winningPrice * config.contourMultiplier : winningPrice;
    const basis = shopPrice >= marginPrice ? `Shop rate ($${shopPrice.toFixed(2)})` : `${config.marginPercent}% margin floor ($${marginPrice.toFixed(2)})`;
    return {
    breakdown: { ...layout.geometry, totalSqFt: layout.total },
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${basis}${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""} · ${layout.total.toFixed(2)} billable sq ft · ${layout.basis}`,
    };
}
export function calculateCustomCoroplastPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const layout = sheetLayoutCount(width, height, quantity, config.sheetWidth, config.sheetHeight, scenario.fluteDirection === "best");
    const sheetTier = config.sheetCostTiers.find((tier) => tier.maximumSheets === null || layout.sheetsRounded <= tier.maximumSheets) ?? config.sheetCostTiers[config.sheetCostTiers.length - 1];
    const sheetCost = scenario.sides === "double" ? sheetTier.doubleSidedPerSheet : sheetTier.singleSidedPerSheet;
    const materialCost = layout.sheetsRounded * sheetCost;
    const shippingCost = shippingBySize(config.shipping, width, height, layout.sheetsRounded);
    const sheetRetailPrice = materialCost / (1 - config.marginPercent / 100);
    const handlingTier = config.handlingTiers.find((tier) => tier.maximumQuantity === null || quantity <= tier.maximumQuantity) ?? config.handlingTiers[config.handlingTiers.length - 1];
    const handlingTotal = quantity * handlingTier.perPiece;
    const standardStakeRetail = scenario.stakeType === "standard" ? quantity * config.standardStakeRetailEach : 0;
    const standardStakeCost = scenario.stakeType === "standard" ? quantity * config.standardStakeCostEach : 0;
    const heavyStakeTotal = scenario.stakeType === "heavy-duty" ? quantity * config.heavyStakeUpchargeEach : 0;
    const grommetTotal = scenario.grommets ? quantity * config.grommetEach + config.grommetSetup : 0;
    const glossTotal = scenario.glossLaminate ? quantity * config.glossEach : 0;
    let productionSubtotal = sheetRetailPrice + handlingTotal + standardStakeRetail + heavyStakeTotal + grommetTotal + glossTotal;
    if (scenario.contourCut)
        productionSubtotal *= config.contourMultiplier;
    if (scenario.rush)
        productionSubtotal *= config.rushMultiplier;
    const retail = productionSubtotal + shippingCost;
    return {
        breakdown: { sheetWidth: config.sheetWidth, sheetHeight: config.sheetHeight, piecesPerSheet: layout.piecesPerSheet, sheetsRounded: layout.sheetsRounded, sheetsUsed: quantity / layout.piecesPerSheet, sheetAcross: layout.across, sheetDown: layout.down, sheetRotated: layout.rotated, previewPieceW: layout.rotated ? height : width, previewPieceH: layout.rotated ? width : height, sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}` },
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost + standardStakeCost,
        materialCost,
        shippingCost,
        calculationBasis: `${config.marginPercent}% sheet margin + $${handlingTier.perPiece.toFixed(2)} handling each${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""}${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""} · ${layout.across} across × ${layout.down} down${layout.rotated ? " rotated" : ""}${scenario.thickness === "10mm" ? " · 10mm shares the 4mm formula" : ""}`,
    };
}
export function calculateVehicleMagnetPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const totalSqIn = width * height * quantity;
    const materialCost = totalSqIn * config.costPerSqIn;
    const shippingCost = totalSqIn >= config.bulkShippingSqInThreshold ? config.bulkShippingCost : config.standardShippingCost;
    let marginPrice = materialCost / (1 - config.marginPercent / 100);
    if (scenario.rush)
        marginPrice *= config.rushMultiplier;
    marginPrice += shippingCost;
    const retail = scenario.style === "contour-cut" ? marginPrice * config.contourMultiplier : marginPrice;
    return {
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${config.marginPercent}% margin floor${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}${scenario.style === "contour-cut" ? ` × ${config.contourMultiplier} contour` : ""}${scenario.style === "rounded-corners" ? " · rounded corners use rectangle pricing" : ""} · ${totalSqIn.toFixed(0)} total sq in`,
    };
}
function areaCostRate(tiers, totalSqFt) {
    return tiers.reduce((selected, tier) => totalSqFt >= tier.minimumSqFt ? tier : selected, tiers[0]);
}
export function calculateMeshBannerPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const totalSqFt = width * height / 144 * quantity;
    const perimeterFt = (width * 2 + height * 2) / 12;
    const rateTier = areaCostRate(config.supplierRateTiers, totalSqFt);
    const materialCost = totalSqFt * rateTier.costPerSqFt;
    const oversized = width >= config.oversizedWidthInches && height >= config.oversizedHeightInches;
    const shippingCost = totalSqFt >= config.bulkShippingSqFtThreshold || oversized ? config.bulkShippingCost : config.standardShippingCost;
    const polePocketCost = scenario.polePocket ? perimeterFt * quantity * config.polePocketPerPerimeterFt + config.polePocketSetup : 0;
    const ropeCost = scenario.rope ? perimeterFt * quantity * config.ropePerPerimeterFt : 0;
    const webbingCost = scenario.webbing ? perimeterFt * quantity * config.webbingPerPerimeterFt : 0;
    const optionsCost = polePocketCost + ropeCost + webbingCost;
    let marginPrice = (materialCost + optionsCost) / (1 - config.marginPercent / 100);
    if (scenario.rush)
        marginPrice *= config.rushMultiplier;
    const retail = marginPrice + shippingCost;
    const ignoredOptions = [scenario.grommets ? "grommets" : "", scenario.welding ? "welded hems" : ""].filter(Boolean);
    return {
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost + optionsCost,
        materialCost,
        shippingCost,
        calculationBasis: `${totalSqFt.toFixed(2)} sq ft × $${rateTier.costPerSqFt.toFixed(2)} supplier cost + finishing at ${config.marginPercent}% margin${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}${ignoredOptions.length ? ` · ${ignoredOptions.join(" and ")} currently unpriced` : ""}`,
    };
}
export function calculatePosterPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const totalSqFt = width * height / 144 * quantity;
    const rateTier = areaCostRate(config.supplierRateTiers, totalSqFt);
    const materialCost = totalSqFt * rateTier.costPerSqFt;
    const oversized = width >= config.oversizedDimensionInches || height >= config.oversizedDimensionInches;
    const shippingCost = totalSqFt >= config.bulkShippingSqFtThreshold || oversized ? config.bulkShippingCost : config.standardShippingCost;
    let marginPrice = materialCost / (1 - config.marginPercent / 100);
    if (scenario.rush)
        marginPrice *= config.rushMultiplier;
    const retail = marginPrice + shippingCost;
    return {
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${totalSqFt.toFixed(2)} sq ft × $${rateTier.costPerSqFt.toFixed(2)} supplier cost at ${config.marginPercent}% margin${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}${oversized ? " · oversized freight" : ""}`,
    };
}
export function calculateAcrylicPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const squareInchesEach = width * height;
    const materialCost = Math.max(squareInchesEach * config.costPerSqIn, config.minimumCostEach) * quantity;
    const layout = sheetLayoutCount(width, height, quantity, config.sheetWidth, config.sheetHeight);
    const shippingCost = shippingBySize(config.shipping, width, height, layout.sheetsRounded);
    const standOffRate = config.standOffRates.find((entry) => entry.key === scenario.standOffColor) ?? config.standOffRates[0];
    const standOffQty = scenario.standOffs ? Math.max(Number(scenario.standOffQty) || 0, 0) : 0;
    const standOffDirectCost = standOffQty * standOffRate.directEach;
    const standOffRetailCharge = standOffQty * standOffRate.retailEach;
    let marginPrice = materialCost / (1 - config.marginPercent / 100);
    if (scenario.roundedCorners)
        marginPrice += config.roundedCornerFlatCharge;
    marginPrice += shippingCost;
    const subtotalBeforeContour = marginPrice + standOffRetailCharge;
    const retail = scenario.contourCut ? subtotalBeforeContour * config.contourMultiplier : subtotalBeforeContour;
    return {
        breakdown: { sheetWidth: config.sheetWidth, sheetHeight: config.sheetHeight, piecesPerSheet: layout.piecesPerSheet, sheetsRounded: layout.sheetsRounded, sheetsUsed: quantity / layout.piecesPerSheet, sheetAcross: layout.across, sheetDown: layout.down, sheetRotated: layout.rotated, previewPieceW: layout.rotated ? height : width, previewPieceH: layout.rotated ? width : height, sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}` },
        retail,
        each: retail / quantity,
        directCost: materialCost + standOffDirectCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${config.marginPercent}% margin floor${scenario.roundedCorners ? ` + $${config.roundedCornerFlatCharge.toFixed(2)} rounded corners` : ""}${scenario.standOffs ? ` + ${standOffQty} ${standOffRate.label.toLowerCase()} stand-offs` : ""}${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""}${scenario.rush ? " · rush currently unpriced" : ""} · ${layout.across} across × ${layout.down} down${layout.rotated ? " rotated" : ""}`,
    };
}
export function calculateFoamcorePreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const layout = sheetLayoutCount(width, height, quantity, config.sheetWidth, config.sheetHeight);
    const sheetTier = config.sheetCostTiers.find((tier) => tier.maximumSheets === null || layout.sheetsRounded <= tier.maximumSheets) ?? config.sheetCostTiers[config.sheetCostTiers.length - 1];
    const sheetPrice = scenario.sides === "double" ? sheetTier.doubleSidedPerSheet : sheetTier.singleSidedPerSheet;
    const materialCost = layout.sheetsRounded * sheetPrice;
    const shippingCost = shippingBySize(config.shipping, width, height, layout.sheetsRounded);
    const sheetRetailPrice = materialCost / (1 - config.marginPercent / 100);
    const handlingTier = config.handlingTiers.find((tier) => tier.maximumQuantity === null || quantity <= tier.maximumQuantity) ?? config.handlingTiers[config.handlingTiers.length - 1];
    const handlingTotal = quantity * handlingTier.perPiece;
    const glossTotal = scenario.glossLaminate ? quantity * config.glossEach : 0;
    let productionSubtotal = sheetRetailPrice + handlingTotal + glossTotal;
    if (scenario.contourCut)
        productionSubtotal *= config.contourMultiplier;
    if (scenario.rush)
        productionSubtotal *= config.rushMultiplier;
    const retail = productionSubtotal + shippingCost;
    return {
        breakdown: { sheetWidth: config.sheetWidth, sheetHeight: config.sheetHeight, piecesPerSheet: layout.piecesPerSheet, sheetsRounded: layout.sheetsRounded, sheetsUsed: quantity / layout.piecesPerSheet, sheetAcross: layout.across, sheetDown: layout.down, sheetRotated: layout.rotated, previewPieceW: layout.rotated ? height : width, previewPieceH: layout.rotated ? width : height, sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}` },
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${layout.sheetsRounded} sheet${layout.sheetsRounded === 1 ? "" : "s"} at ${config.marginPercent}% margin + $${handlingTier.perPiece.toFixed(2)} handling each${scenario.glossLaminate ? ` + $${config.glossEach.toFixed(2)} gloss each` : ""}${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""}${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}${scenario.customCut ? " · custom cut currently unpriced" : ""} · ${layout.across} across × ${layout.down} down${layout.rotated ? " rotated" : ""}`,
    };
}
export function calculatePvcPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const material = config.materials.find((entry) => entry.key === scenario.material) ?? config.materials[0];
    const layout = sheetLayoutCount(width, height, quantity, config.sheetWidth, config.sheetHeight);
    const sheetTier = material.sheetCostTiers.find((tier) => tier.maximumSheets === null || layout.sheetsRounded <= tier.maximumSheets) ?? material.sheetCostTiers[material.sheetCostTiers.length - 1];
    const materialCost = layout.sheetsRounded * sheetTier.perSheet;
    const shippingCost = shippingBySize(config.shipping, width, height, layout.sheetsRounded);
    const sheetRetailPrice = materialCost / (1 - config.marginPercent / 100);
    const handlingTier = config.handlingTiers.find((tier) => tier.maximumQuantity === null || quantity <= tier.maximumQuantity) ?? config.handlingTiers[config.handlingTiers.length - 1];
    const handlingTotal = quantity * handlingTier.perPiece;
    let productionSubtotal = sheetRetailPrice + handlingTotal;
    if (scenario.contourCut)
        productionSubtotal *= config.contourMultiplier;
    if (scenario.rush)
        productionSubtotal *= config.rushMultiplier;
    const retail = productionSubtotal + shippingCost;
    return {
        breakdown: { sheetWidth: config.sheetWidth, sheetHeight: config.sheetHeight, piecesPerSheet: layout.piecesPerSheet, sheetsRounded: layout.sheetsRounded, sheetsUsed: quantity / layout.piecesPerSheet, sheetAcross: layout.across, sheetDown: layout.down, sheetRotated: layout.rotated, previewPieceW: layout.rotated ? height : width, previewPieceH: layout.rotated ? width : height, sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}` },
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${material.label} · ${layout.sheetsRounded} sheet${layout.sheetsRounded === 1 ? "" : "s"} at ${config.marginPercent}% margin + $${handlingTier.perPiece.toFixed(2)} handling each${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""}${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}${scenario.customCut ? " · custom cut currently unpriced" : ""} · ${layout.across} across × ${layout.down} down${layout.rotated ? " rotated" : ""}`,
    };
}
export function calculatePolystyrenePreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const layout = sheetLayoutCount(width, height, quantity, config.sheetWidth, config.sheetHeight);
    const sheetTier = config.sheetCostTiers.find((tier) => tier.maximumSheets === null || layout.sheetsRounded <= tier.maximumSheets) ?? config.sheetCostTiers[config.sheetCostTiers.length - 1];
    const sheetPrice = scenario.sides === "double" ? sheetTier.doubleSidedPerSheet : sheetTier.singleSidedPerSheet;
    const materialCost = layout.sheetsRounded * sheetPrice;
    const shippingCost = shippingBySize(config.shipping, width, height, layout.sheetsRounded);
    const glossDirectCost = scenario.glossLaminate ? quantity * config.glossDirectCostEach : 0;
    const sheetRetailPrice = materialCost / (1 - config.marginPercent / 100);
    const glossRetail = glossDirectCost / (1 - config.marginPercent / 100);
    const handlingTier = config.handlingTiers.find((tier) => tier.maximumQuantity === null || quantity <= tier.maximumQuantity) ?? config.handlingTiers[config.handlingTiers.length - 1];
    const handlingTotal = quantity * handlingTier.perPiece;
    let productionSubtotal = sheetRetailPrice + handlingTotal + glossRetail;
    if (scenario.contourCut)
        productionSubtotal *= config.contourMultiplier;
    if (scenario.rush)
        productionSubtotal *= config.rushMultiplier;
    const retail = productionSubtotal + shippingCost;
    return {
        breakdown: { sheetWidth: config.sheetWidth, sheetHeight: config.sheetHeight, piecesPerSheet: layout.piecesPerSheet, sheetsRounded: layout.sheetsRounded, sheetsUsed: quantity / layout.piecesPerSheet, sheetAcross: layout.across, sheetDown: layout.down, sheetRotated: layout.rotated, previewPieceW: layout.rotated ? height : width, previewPieceH: layout.rotated ? width : height, sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}` },
        retail,
        each: retail / quantity,
        directCost: materialCost + glossDirectCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${layout.sheetsRounded} sheet${layout.sheetsRounded === 1 ? "" : "s"} at ${config.marginPercent}% margin + $${handlingTier.perPiece.toFixed(2)} handling each${scenario.glossLaminate ? ` + $${config.glossDirectCostEach.toFixed(2)} gloss each at margin` : ""}${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""}${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}${scenario.customCut ? " · custom cut currently unpriced" : ""} · ${layout.across} across × ${layout.down} down${layout.rotated ? " rotated" : ""}`,
    };
}
export function calculateAluminumPreview(config, scenario) {
    const width = Math.max(Number(scenario.width) || 0, 0.01);
    const height = Math.max(Number(scenario.height) || 0, 0.01);
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const material = config.materials.find((entry) => entry.key === scenario.material) ?? config.materials[0];
    const squareInchesEach = width * height;
    const costEach = Math.max(squareInchesEach * material.costPerSqIn, material.minimumCostEach);
    const materialCost = costEach * quantity;
    const layout = sheetLayoutCount(width, height, quantity, config.sheetWidth, config.sheetHeight);
    const shippingCost = shippingBySize(config.shipping, width, height, layout.sheetsRounded);
    const sheetTier = material.sheetCostTiers.find((tier) => tier.maximumSheets === null || layout.sheetsRounded <= tier.maximumSheets) ?? material.sheetCostTiers[material.sheetCostTiers.length - 1];
    const squareInchDirectWithOptions = materialCost + (scenario.roundedCorners ? config.roundedCornerSqInDirectFee : 0);
    const fullSheetDirectWithOptions = layout.sheetsRounded * sheetTier.perSheet + (scenario.roundedCorners ? config.roundedCornerSheetDirectFee : 0);
    const optimizationSavings = squareInchDirectWithOptions - fullSheetDirectWithOptions;
    const recommendFullSheet = optimizationSavings > 0;
    let baseRetail = materialCost / (1 - config.marginPercent / 100);
    if (scenario.contourCut)
        baseRetail *= config.contourMultiplier;
    const roundedCornerRetail = scenario.roundedCorners
        ? recommendFullSheet ? config.roundedCornerOptimizedRetailFee : config.roundedCornerRetailFee
        : 0;
    const retail = baseRetail + roundedCornerRetail + shippingCost;
    return {
        breakdown: { sheetWidth: config.sheetWidth, sheetHeight: config.sheetHeight, piecesPerSheet: layout.piecesPerSheet, sheetsRounded: layout.sheetsRounded, sheetsUsed: quantity / layout.piecesPerSheet, sheetAcross: layout.across, sheetDown: layout.down, sheetRotated: layout.rotated, previewPieceW: layout.rotated ? height : width, previewPieceH: layout.rotated ? width : height, sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}`, fullSheetDirectCost: fullSheetDirectWithOptions, fullSheetDirectMaterial: layout.sheetsRounded * sheetTier.perSheet, fullSheetPriceEach: sheetTier.perSheet, sqInDirectCost: squareInchDirectWithOptions, optimizationSavings, shouldRecommendFullSheet: recommendFullSheet, recommendedMethod: recommendFullSheet ? "Full Sheet" : "Square Inch", roundedCornersRetailFee: roundedCornerRetail },
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${material.label} · square-inch cost at ${config.marginPercent}% margin${scenario.contourCut ? ` × ${config.contourMultiplier} contour` : ""}${scenario.roundedCorners ? ` + $${roundedCornerRetail.toFixed(2)} rounded corners` : ""} · ${recommendFullSheet ? `full-sheet purchase recommended (saves $${optimizationSavings.toFixed(2)})` : "square-inch purchase retained"}${scenario.rush ? " · rush currently unpriced" : ""} · ${layout.across} across × ${layout.down} down${layout.rotated ? " rotated" : ""}`,
    };
}
export function calculateBusinessCardPreview(config, scenario) {
    const tier = config.priceTiers.find((entry) => entry.quantity === scenario.quantity) ?? config.priceTiers[0];
    const baseRetail = scenario.sides === "double" ? tier.doubleSidedTotal : tier.singleSidedTotal;
    const retail = scenario.rush ? baseRetail * config.rushMultiplier : baseRetail;
    const ignoredOptions = [scenario.coating ? "coating" : "", scenario.orientation ? "orientation" : ""].filter(Boolean);
    return {
        retail,
        each: retail / tier.quantity,
        directCost: config.freightDirectCost,
        materialCost: 0,
        shippingCost: config.freightDirectCost,
        calculationBasis: `${tier.quantity} · ${scenario.sides === "double" ? "double" : "single"}-sided fixed total${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""} · $${config.freightDirectCost.toFixed(2)} freight tracked as direct cost only${ignoredOptions.length ? ` · ${ignoredOptions.join(" and ")} currently unpriced` : ""}`,
    };
}
export function calculateHandheldPaperPreview(config, scenario) {
    const quantity = Math.max(Number(scenario.quantity) || 0, 1);
    const size = config.sizes.find((entry) => entry.key === scenario.size) ?? config.sizes[0];
    const sheetsRequired = Math.max(Math.ceil(quantity / size.piecesPerSheet), 1);
    const materialCost = sheetsRequired * config.materialCostPerSheet;
    const shippingCost = Math.ceil(sheetsRequired / config.freightSheetGroupSize) * config.freightPerGroup;
    const areaEach = Math.max(size.width * size.height, 1);
    const rateTier = config.areaRateTiers.reduce((selected, tier) => quantity >= tier.minimumQuantity ? tier : selected, config.areaRateTiers[0]);
    const ratePerSqIn = rateTier.referenceTotal / rateTier.referenceQuantity / config.referenceAreaSqIn;
    const areaBasedRetail = quantity * areaEach * ratePerSqIn;
    const marginPrice = materialCost / (1 - config.marginPercent / 100);
    let basePrice = Math.max(areaBasedRetail, marginPrice);
    if (scenario.rush)
        basePrice *= config.rushMultiplier;
    const retail = basePrice + shippingCost;
    const basis = areaBasedRetail >= marginPrice ? `area rate ($${areaBasedRetail.toFixed(2)})` : `${config.marginPercent}% margin floor ($${marginPrice.toFixed(2)})`;
    return {
        retail,
        each: retail / quantity,
        directCost: materialCost + shippingCost,
        materialCost,
        shippingCost,
        calculationBasis: `${size.label} · ${sheetsRequired} sheet${sheetsRequired === 1 ? "" : "s"} · ${basis}${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""} + freight · sides, coating, and orientation currently unpriced`,
    };
}
export function calculateCarbonlessPreview(config, scenario) {
    const group = config.costGroups.find((entry) => entry.size === scenario.size && entry.formType === scenario.formType) ?? config.costGroups[0];
    const point = group.costs.find((entry) => entry.quantity === Number(scenario.quantity)) ?? group.costs[0];
    const usesFullColorFallback = scenario.printType === "Full Color" && !(point.fullColor && point.fullColor > 0);
    let directCost = scenario.printType === "Full Color"
        ? usesFullColorFallback ? point.blackInk * config.fullColorFallbackMultiplier : Number(point.fullColor)
        : point.blackInk;
    if (scenario.printSides === "Front and Back")
        directCost *= config.frontBackMultiplier;
    const numberingTier = config.numberingTiers.reduce((selected, tier) => point.quantity >= tier.minimumQuantity ? tier : selected, config.numberingTiers[0]);
    if (scenario.numbering)
        directCost += numberingTier.flatCost;
    if (scenario.wraparound)
        directCost += config.wraparoundFlatCost;
    if (scenario.bookedSets)
        directCost += config.bookedSetsFlatCost;
    const retail = directCost * config.retailMultiplier * (scenario.rush ? config.rushMultiplier : 1);
    return {
        retail,
        each: retail / point.quantity,
        directCost,
        materialCost: directCost,
        shippingCost: 0,
        calculationBasis: `${group.size} · ${group.formType} · ${point.quantity.toLocaleString()} · ${scenario.printType}${usesFullColorFallback ? ` uses black × ${config.fullColorFallbackMultiplier} fallback` : " table cost"}${scenario.printSides === "Front and Back" ? ` × ${config.frontBackMultiplier} front/back` : ""}${scenario.numbering ? ` + $${numberingTier.flatCost.toFixed(2)} numbering` : ""}${scenario.wraparound ? ` + $${config.wraparoundFlatCost.toFixed(2)} wraparound` : ""}${scenario.bookedSets ? ` + $${config.bookedSetsFlatCost.toFixed(2)} booked sets` : ""} × ${config.retailMultiplier} retail${scenario.rush ? ` × ${config.rushMultiplier} rush` : ""}`,
    };
}
export function calculateDoorHangerPreview(config, scenario) {
    const quantity = Math.max(Number(scenario.quantity) || config.referenceQuantity, 1);
    const referenceSize = config.sizes[0];
    const size = config.sizes.find((entry) => entry.key === scenario.size) ?? referenceSize;
    const frontInk = config.frontInkMultipliers.find((entry) => entry.key === scenario.frontInk) ?? config.frontInkMultipliers[0];
    const backPrinting = config.backPrintingMultipliers.find((entry) => entry.key === scenario.backPrinting) ?? config.backPrintingMultipliers[0];
    const shrinkWrap = config.shrinkWrapMultipliers.find((entry) => entry.key === scenario.shrinkWrap) ?? config.shrinkWrapMultipliers[0];
    const quantityScale = quantity / config.referenceQuantity;
    const sizeScale = size.areaSqIn / referenceSize.areaSqIn;
    const perforationMultiplier = 1 + scenario.perforationCount * config.perforationMultiplierPerCount;
    const directCost = config.referenceDirectCost * quantityScale * sizeScale * frontInk.multiplier * backPrinting.multiplier * perforationMultiplier * shrinkWrap.multiplier;
    const retail = directCost / (1 - config.marginPercent / 100);
    return {
        retail,
        each: retail / quantity,
        directCost,
        materialCost: directCost,
        shippingCost: 0,
        calculationBasis: `${size.key} area scale ${sizeScale.toFixed(4)} × quantity scale ${quantityScale.toFixed(4)} × ${scenario.frontInk} ${frontInk.multiplier} × ${scenario.backPrinting} back ${backPrinting.multiplier}${scenario.perforationCount ? ` × ${scenario.perforationCount} perforation${scenario.perforationCount === 1 ? "" : "s"} ${perforationMultiplier.toFixed(2)}` : ""} × ${scenario.shrinkWrap} ${shrinkWrap.multiplier} ÷ ${(1 - config.marginPercent / 100).toFixed(2)} retail divisor · stock type currently unpriced`,
    };
}
