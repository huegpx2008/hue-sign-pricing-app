"use client";

import { useEffect, useMemo, useState } from "react";

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const num = (v, fallback = 0) => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const products = {
  coro: "Coroplast Yard Signs",
  banner: "Vinyl Banners",
  meshBanner: "Mesh Banners",
  acm: "ACM / Maxmetal",
  acrylic: "Acrylic",
  vinyl: "Printed Vinyl",
  poster: "Poster Paper",
};

const acrylicOption = { name: "Acrylic", costPerSqIn: 0.1, minCost: 14.4 };

const acrylicStandOffOptions = {
  silver: { name: "Silver", directEach: 2.5, retailEach: 4 },
  black: { name: "Black", directEach: 3.5, retailEach: 5 },
};

const productCategories = [
  {
    name: "Signs & Banners",
    items: [
      { id: "coro", label: "Coroplast Yard Signs", calculator: "coro" },
      { id: "coroSigns", label: "Coro Signs", calculator: "coro" },
      { id: "banner", label: "Vinyl Banners", calculator: "banner" },
      { id: "meshBanner", label: "Mesh Banners", calculator: "meshBanner" },
      { id: "acm", label: "ACM / Maxmetal", calculator: "acm" },
      { id: "poster", label: "Poster Paper", calculator: "poster" },
      { id: "acrylic", label: "Acrylic", calculator: "acrylic" }, { id: "foamcore", label: "Foamcore" },
      { id: "pvc", label: "PVC" }, { id: "polystyrene", label: "Polystyrene" },
      { id: "aluminum", label: "Aluminum" }, { id: "backlit", label: "Backlit" },
      { id: "vehicleMagnets", label: "Vehicle Magnets" },
    ],
  },
  {
    name: "Vinyl / Decals",
    items: [
      { id: "vinyl", label: "Printed Vinyl", calculator: "vinyl" },
      { id: "footprints", label: "FootPrints Vinyl" }, { id: "bootprints", label: "BootPrints Vinyl" },
      { id: "reflective", label: "Reflective Vinyl" }, { id: "wallVinyl", label: "Wall Vinyl" },
      { id: "windowPerf", label: "Window Perforated Vinyl" }, { id: "staticCling", label: "Static Cling" },
      { id: "decals", label: "Decals / Stickers" },
    ],
  },
  {
    name: "Apparel",
    items: [
      { id: "apparelItem", label: "Apparel Item" },
      { id: "dtfTransfers", label: "DTF Transfers" },
      { id: "embroidery", label: "Embroidery" },
    ],
  },
  {
    name: "Paper Printing",
    items: [
      { id: "businessCards", label: "Business Cards" },
      { id: "carbonless", label: "Carbonless Forms" },
      { id: "doorHangers", label: "Door Hangers" },
      { id: "notepads", label: "Notepads" },
      { id: "envelopes", label: "Envelopes" },
    ],
  },
];

const productMap = Object.fromEntries(productCategories.flatMap((c) => c.items.map((i) => [i.id, i])));
const allProducts = productCategories.flatMap((c) => c.items.map((i) => ({ ...i, category: c.name })));

const bannerOptions = {
  "13-single": { name: "13oz Single-Sided", cost: 1.25, retail: 5 },
  "13-double": { name: "13oz Double-Sided", cost: 1.25, retail: 8 },
  "15-single": { name: "15oz Single-Sided", cost: 1.75, retail: 7 },
  "18-single": { name: "18oz Single-Sided", cost: 2.25, retail: 9 },
  "18-double": { name: "18oz Double-Sided", cost: 4.25, retail: 17 },
};

const acmOptions = {
  "3-single": { name: "3mm Single-Sided", costPerSqIn: 0.05, minCost: 7.2 },
  "3-double": { name: "3mm Double-Sided", costPerSqIn: 0.06, minCost: 8.64 },
  "6-single": { name: "6mm Single-Sided", costPerSqIn: 0.08, minCost: 11.52 },
  "6-double": { name: "6mm Double-Sided", costPerSqIn: 0.09, minCost: 12.96 },
};

const vinylOptions = {
  "gf-standard": { name: "GF 203OAPAE Standard Vinyl", cost: 2.49, retail: 8.75 },
  "3m-premium": { name: "3M IJ-35C Premium Vinyl", cost: 2.99, retail: 10.51 },
  "gf830-auto": { name: "GF830 AutoMark Vehicle Vinyl", cost: 3.99, retail: 14.02 },
  "3m-controltac": { name: "3M Controltac Premium Vehicle Vinyl", cost: 4.99, retail: 17.54 },
  "low-tac-wall": { name: "Low Tac Wall Vinyl", cost: 3.47, retail: 12.2 },
};

const coroPricing = {
  single: [
    { min: 1, price: 25 },
    { min: 5, price: 15 },
    { min: 10, price: 13.75 },
    { min: 24, price: 10.75 },
    { min: 50, price: 9.9 },
    { min: 100, price: 8.25 },
  ],
  double: [
    { min: 1, price: 28 },
    { min: 5, price: 18 },
    { min: 10, price: 16.75 },
    { min: 24, price: 13.7 },
    { min: 50, price: 12.9 },
    { min: 100, price: 11.75 },
  ],
};

const coroSheetCost = {
  single: [44, 33, 30],
  double: [55, 44, 40],
};

function getTierPrice(qty, type) {
  let price = coroPricing[type][0].price;
  for (let t of coroPricing[type]) {
    if (qty >= t.min) price = t.price;
  }
  return price;
}

function getCoroSheetCost(sheetCount, type) {
  if (sheetCount <= 9) return coroSheetCost[type][0];
  if (sheetCount <= 50) return coroSheetCost[type][1];
  return coroSheetCost[type][2];
}

function shippingBySize(w, h, sheets) {
  const max = Math.max(w, h);
  const min = Math.min(w, h);

  function perGroup(rate, groupSize = 3) {
    return Math.ceil(sheets / groupSize) * rate;
  }

  if (max <= 36 && min <= 24) {
    return sheets >= 58 ? 199 : perGroup(10, 3);
  }

  if (max <= 48 && min <= 32) {
    return sheets >= 22 ? 199 : perGroup(15, 3);
  }

  if (max <= 48 && min <= 36) {
    return sheets >= 22 ? 199 : perGroup(35, 3);
  }

  if (max <= 48 && min <= 48) {
    if (sheets >= 10) return 199;
    if (sheets >= 6) return 75;
    return 50;
  }

  if ((max <= 72 && min <= 39) || (max <= 96 && min <= 24)) {
    return sheets >= 10 ? 199 : 75;
  }

  if (max <= 96 && min <= 48) {
    return 199;
  }

  return 199;
}

function sheetLayoutCount(w, h, qty, allowRotate = true) {
  const sheetW = 48;
  const sheetH = 96;

  const normalAcross = Math.max(Math.floor(sheetW / w), 0);
  const normalDown = Math.max(Math.floor(sheetH / h), 0);
  const normalPerSheet = Math.max(normalAcross * normalDown, 1);

  const rotatedAcross = Math.max(Math.floor(sheetW / h), 0);
  const rotatedDown = Math.max(Math.floor(sheetH / w), 0);
  const rotatedPerSheet = Math.max(rotatedAcross * rotatedDown, 1);

  const useRotated = allowRotate && rotatedPerSheet > normalPerSheet;
  const piecesPerSheet = useRotated ? rotatedPerSheet : normalPerSheet;

  return {
    piecesPerSheet,
    sheetsUsed: qty / piecesPerSheet,
    sheetsRounded: Math.ceil(qty / piecesPerSheet),
    rotated: useRotated,
    across: useRotated ? rotatedAcross : normalAcross,
    down: useRotated ? rotatedDown : normalDown,
  };
}

function calculateLayout(pieceW, pieceH, qty, rollWidth) {
  const piecesAcross = Math.max(Math.floor(rollWidth / pieceW), 1);
  const rows = Math.ceil(qty / piecesAcross);
  const rawHeight = rows * pieceH;
  const roundedHeight = Math.ceil(rawHeight / 12) * 12;
  const totalSqFt = (rollWidth * roundedHeight) / 144;

  return {
    piecesAcross,
    rows,
    rawHeight,
    roundedHeight,
    totalSqFt,
    pieceW,
    pieceH,
  };
}

function getVinylBillableSqFt(w, h, qty, gangVinyl, vinylContour, contourPadding, gangWastePercent) {
  const actualEach = (w * h) / 144;
  const pad = vinylContour && gangVinyl ? contourPadding * 2 : 0;

  const effectiveW = w + pad;
  const effectiveH = h + pad;
  const effectiveEach = (effectiveW * effectiveH) / 144;

  if (!gangVinyl) {
    const roundedHeight = Math.ceil(h / 12) * 12;
    const billableEach = (w * roundedHeight) / 144;

    return {
      actualEach,
      effectiveEach: actualEach,
      billableEach,
      totalBillable: billableEach * qty,
      mode: "Single piece billing",
      layoutWidth: w,
      layoutHeight: roundedHeight,
    };
  }

  const rollWidth = 52;

  const normal = calculateLayout(effectiveW, effectiveH, qty, rollWidth);
  const rotated = calculateLayout(effectiveH, effectiveW, qty, rollWidth);

  const best =
    normal.totalSqFt <= rotated.totalSqFt
      ? { ...normal, rotated: false }
      : { ...rotated, rotated: true };

  const wasteMultiplier = vinylContour ? 1 + num(gangWastePercent, 0) / 100 : 1;
  const totalBillable = Math.ceil(best.totalSqFt * wasteMultiplier);

  return {
    actualEach,
    effectiveEach,
    billableEach: totalBillable / qty,
    totalBillable,
    mode: `Ganged layout: ${best.piecesAcross} across x ${best.rows} rows${best.rotated ? " (ROTATED)" : ""}`,
    piecesAcross: best.piecesAcross,
    rows: best.rows,
    layoutWidth: rollWidth,
    layoutHeight: best.roundedHeight,
    rawBillable: best.totalSqFt,
    pieceW: best.pieceW,
    pieceH: best.pieceH,
    rotated: best.rotated,
    normalSqFt: normal.totalSqFt,
    rotatedSqFt: rotated.totalSqFt,
  };
}

export default function Page() {
  const [product, setProduct] = useState("coro");
  const [width, setWidth] = useState(24);
  const [height, setHeight] = useState(18);
  const [qty, setQty] = useState(1);
  const [margin, setMargin] = useState(60);
  const [multiplier, setMultiplier] = useState(1);

  const [useDesignFee, setUseDesignFee] = useState(false);
  const [useSetupFee, setUseSetupFee] = useState(false);
  const [designFee, setDesignFee] = useState("");
  const [setupFee, setSetupFee] = useState("");
  const [delivery, setDelivery] = useState("");

  const [coroDouble, setCoroDouble] = useState(false);
  const [coroFlute, setCoroFlute] = useState("vertical");
  const [stakes, setStakes] = useState(false);
  const [heavyStakes, setHeavyStakes] = useState(false);
  const [grommets, setGrommets] = useState(false);
  const [gloss, setGloss] = useState(false);
  const [coroContour, setCoroContour] = useState(false);
  const [coroRush, setCoroRush] = useState(false);

  const [bannerType, setBannerType] = useState("13-single");
  const [polePocket, setPolePocket] = useState(false);
  const [rope, setRope] = useState(false);
  const [windSlits, setWindSlits] = useState(false);
  const [bannerRush, setBannerRush] = useState(false);
  const [meshPolePocket, setMeshPolePocket] = useState(false);
  const [meshGrommets, setMeshGrommets] = useState(false);
  const [meshWelding, setMeshWelding] = useState(false);
  const [meshRope, setMeshRope] = useState(false);
  const [meshWebbing, setMeshWebbing] = useState(false);
  const [meshRush, setMeshRush] = useState(false);

  const [acmType, setAcmType] = useState("3-single");
  const [acmSqFtPrice, setAcmSqFtPrice] = useState(18);
  const [acmContour, setAcmContour] = useState(false);
  const [roundedCorners, setRoundedCorners] = useState(false);
  const [acrylicContour, setAcrylicContour] = useState(false);
  const [acrylicRoundedCorners, setAcrylicRoundedCorners] = useState(false);
  const [acrylicStandOffs, setAcrylicStandOffs] = useState(false);
  const [acrylicStandOffQty, setAcrylicStandOffQty] = useState(4);
  const [acrylicStandOffColor, setAcrylicStandOffColor] = useState("silver");

  const [vinylType, setVinylType] = useState("gf-standard");
  const [vinylLaminate, setVinylLaminate] = useState("Gloss Laminate");
  const [vinylContour, setVinylContour] = useState(false);
  const [vinylRush, setVinylRush] = useState(false);
  const [gangVinyl, setGangVinyl] = useState(false);
  const [contourPadding, setContourPadding] = useState(0.5);
  const [gangWastePercent, setGangWastePercent] = useState(15);

  const [posterRush, setPosterRush] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [presetProduct, setPresetProduct] = useState("coro");

  const activeProduct = productMap[product]?.calculator || null;


  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("hue-theme") : null;
    if (savedTheme === "dark") setTheme("dark");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("hue-theme", theme);
  }, [theme]);

  useEffect(() => {
    const linked = activeProduct && presetGroups[activeProduct] ? activeProduct : "coro";
    setPresetProduct(linked);
  }, [activeProduct]);

  function resetAll() {
    setProduct("coro"); setWidth(24); setHeight(18); setQty(1); setMargin(60); setMultiplier(1);
    setUseDesignFee(false); setUseSetupFee(false); setDesignFee(""); setSetupFee(""); setDelivery("");
    setCoroDouble(false); setCoroFlute("vertical"); setStakes(false); setHeavyStakes(false); setGrommets(false); setGloss(false); setCoroContour(false); setCoroRush(false);
    setBannerType("13-single"); setPolePocket(false); setRope(false); setWindSlits(false); setBannerRush(false);
    setMeshPolePocket(false); setMeshGrommets(false); setMeshWelding(false); setMeshRope(false); setMeshWebbing(false); setMeshRush(false);
    setAcmType("3-single"); setAcmSqFtPrice(18); setAcmContour(false); setRoundedCorners(false);
    setAcrylicContour(false); setAcrylicRoundedCorners(false); setAcrylicStandOffs(false); setAcrylicStandOffQty(4); setAcrylicStandOffColor("silver");
    setVinylType("gf-standard"); setVinylLaminate("Gloss Laminate"); setVinylContour(false); setVinylRush(false); setGangVinyl(false); setContourPadding(0.5); setGangWastePercent(15);
    setPosterRush(false);
  }

  function preset(prod, w, h, double = false) {
    setProduct(prod);
    setWidth(w);
    setHeight(h);
    if (prod === "coro") {
      setCoroDouble(double);
      setCoroFlute("vertical");
    }
  }

  function isPresetActive(prod, w, h, double = false) {
    return product === prod && num(width) === w && num(height) === h && (prod !== "coro" || coroDouble === double);
  }

  function presetClass(prod, w, h, double = false) {
    return isPresetActive(prod, w, h, double) ? "presetBtn activePreset" : "presetBtn";
  }


  const presetGroups = {
    coro: [
      { label: "18x24 Single", w: 24, h: 18, double: false },
      { label: "18x24 Double", w: 24, h: 18, double: true },
      { label: "12x18 Single", w: 18, h: 12, double: false },
      { label: "12x18 Double", w: 18, h: 12, double: true },
    ],
    banner: [
      { label: "24x36", w: 36, h: 24 }, { label: "36x60", w: 60, h: 36 }, { label: "36x72", w: 72, h: 36 },
      { label: "36x96", w: 96, h: 36 }, { label: "48x96", w: 96, h: 48 },
    ],
    acm: [
      { label: "18x24", w: 24, h: 18 }, { label: "24x36", w: 24, h: 36 }, { label: "24x48", w: 24, h: 48 },
      { label: "32x48", w: 32, h: 48 }, { label: "36x48", w: 36, h: 48 }, { label: "48x48", w: 48, h: 48 },
      { label: "24x96", w: 24, h: 96 }, { label: "48x96", w: 48, h: 96 },
    ],
    acrylic: [
      { label: "12x18", w: 12, h: 18 }, { label: "18x24", w: 18, h: 24 }, { label: "24x36", w: 24, h: 36 },
      { label: "24x48", w: 24, h: 48 }, { label: "32x48", w: 32, h: 48 }, { label: "36x48", w: 36, h: 48 },
      { label: "48x48", w: 48, h: 48 },
    ],
    meshBanner: [
      { label: "24x36", w: 36, h: 24 }, { label: "36x60", w: 60, h: 36 }, { label: "36x72", w: 72, h: 36 },
      { label: "36x96", w: 96, h: 36 }, { label: "48x96", w: 96, h: 48 }, { label: "60x120", w: 120, h: 60 },
    ],
    vinyl: [
      { label: "12x12", w: 12, h: 12 }, { label: "12x24", w: 24, h: 12 }, { label: "24x24", w: 24, h: 24 },
      { label: "24x36", w: 36, h: 24 }, { label: "24x48", w: 48, h: 24 }, { label: "48x96", w: 96, h: 48 },
    ],
    poster: [
      { label: "11x17", w: 17, h: 11 }, { label: "18x24", w: 24, h: 18 }, { label: "24x36", w: 36, h: 24 },
      { label: "36x48", w: 48, h: 36 }, { label: "48x72", w: 72, h: 48 }, { label: "48x96", w: 96, h: 48 },
    ],
  };

  const calc = useMemo(() => {
    const q = Math.max(num(qty, 1), 1);
    const w = num(width);
    const h = num(height);
    const m = Math.min(num(margin, 60), 95) / 100;
    const mult = num(multiplier, 1);

    const fees =
      (useDesignFee ? num(designFee) : 0) +
      (useSetupFee ? num(setupFee) : 0) +
      num(delivery);

    const sqInEach = w * h;

    if (!activeProduct) {
      return { label: productMap[product]?.label || "Coming Soon", retail: 0, each: 0, cost: 0, profit: 0, margin: 0, totalSqFt: 0, materialCost: 0, shipping: 0, comingSoon: true };
    }
    const sqFtEach = sqInEach / 144;
    const totalSqFt = sqFtEach * q;

    if (product === "vinyl") {
      const v = vinylOptions[vinylType];

      const vinylSqFt = getVinylBillableSqFt(
        w,
        h,
        q,
        gangVinyl,
        vinylContour,
        num(contourPadding, 0.5),
        num(gangWastePercent, 0)
      );

      const materialCost = vinylSqFt.totalBillable * v.cost;
      const shipping = vinylSqFt.totalBillable >= 1000 ? 199 : 10;
      const directCost = materialCost + shipping;
      const marginCostBase = materialCost;

      let shopPrice = vinylSqFt.totalBillable * v.retail;
      let costMarginPrice = marginCostBase / (1 - m);

      if (vinylContour) {
        shopPrice *= 1.1;
        costMarginPrice *= 1.1;
      }

      if (vinylRush) {
        shopPrice *= 2;
        costMarginPrice *= 2;
      }

      costMarginPrice += shipping;

      const basePrice = Math.max(shopPrice, costMarginPrice);
      const retail = (basePrice + fees) * mult;

      return {
        label: "Printed Vinyl",
        retail,
        each: retail / q,
        cost: directCost,
        profit: retail - directCost,
        margin: retail ? ((retail - directCost) / retail) * 100 : 0,
        totalSqFt: vinylSqFt.totalBillable,
        actualTotalSqFt: vinylSqFt.actualEach * q,
        actualSqFtEach: vinylSqFt.actualEach,
        effectiveSqFtEach: vinylSqFt.effectiveEach,
        billableSqFtEach: vinylSqFt.billableEach,
        billingMode: vinylSqFt.mode,
        layoutWidth: vinylSqFt.layoutWidth,
        layoutHeight: vinylSqFt.layoutHeight,
        rawBillableSqFt: vinylSqFt.rawBillable,
        piecesAcross: vinylSqFt.piecesAcross,
        rows: vinylSqFt.rows,
        pieceW: vinylSqFt.pieceW,
        pieceH: vinylSqFt.pieceH,
        rotated: vinylSqFt.rotated,
        normalSqFt: vinylSqFt.normalSqFt,
        rotatedSqFt: vinylSqFt.rotatedSqFt,
        materialCost,
        shipping,
        shopPrice,
        costMarginPrice,
        basePrice,
      };
    }


    if (product === "poster") {
      const rate = totalSqFt >= 5000 ? 1 : totalSqFt >= 1000 ? 1.5 : 2;
      const materialCost = totalSqFt * rate;
      const shipping = w >= 123 || h >= 123 || totalSqFt >= 1000 ? 199 : 10;
      const directCost = materialCost + shipping;
      const marginCostBase = materialCost;

      let costMarginPrice = marginCostBase / (1 - m);

      if (posterRush) costMarginPrice *= 2;

      costMarginPrice += shipping;

      const basePrice = costMarginPrice;
      const retail = (basePrice + fees) * mult;

      return {
        label: "Poster Paper",
        retail,
        each: retail / q,
        cost: directCost,
        profit: retail - directCost,
        margin: retail ? ((retail - directCost) / retail) * 100 : 0,
        totalSqFt,
        materialCost,
        shipping,
        supplierRate: rate,
        costMarginPrice,
        basePrice,
      };
    }

    if (product === "banner") {
      const b = bannerOptions[bannerType];
      const perimeterFt = (w * 2 + h * 2) / 12;
      const materialCost = totalSqFt * b.cost;
      let basePrice = totalSqFt * b.retail;
      const shipping = totalSqFt >= 1000 ? 199 : 10;

      if (polePocket) basePrice += perimeterFt * q + 10;
      if (rope) basePrice += perimeterFt * q;
      if (windSlits) basePrice += totalSqFt * 0.5;
      if (bannerRush) basePrice *= 2;

      const retail = (basePrice + fees) * mult;

      return {
        label: "Banner",
        retail,
        each: retail / q,
        cost: materialCost + shipping,
        profit: retail - (materialCost + shipping),
        margin: retail ? ((retail - (materialCost + shipping)) / retail) * 100 : 0,
        totalSqFt,
        materialCost,
        shipping,
        basePrice,
      };
    }

    if (product === "meshBanner") {
      const perimeterFt = (w * 2 + h * 2) / 12;
      const supplierRate = totalSqFt >= 5000 ? 0.99 : totalSqFt >= 2500 ? 1.09 : totalSqFt >= 1000 ? 1.49 : 2.44;
      const materialCost = totalSqFt * supplierRate;
      const oversizedFreight = w >= 123 && h >= 123;
      const shipping = totalSqFt >= 1000 || oversizedFreight ? 199 : 10;
      const polePocketCost = meshPolePocket ? perimeterFt * q + 10 : 0;
      const ropeCost = meshRope ? perimeterFt * q : 0;
      const webbingCost = meshWebbing ? perimeterFt * q : 0;
      const optionsCost = polePocketCost + ropeCost + webbingCost;
      const directCost = materialCost + shipping + optionsCost;
      let costMarginPrice = (materialCost + optionsCost) / (1 - m);

      if (meshRush) costMarginPrice *= 2;

      costMarginPrice += shipping;

      const basePrice = costMarginPrice;
      const retail = (basePrice + fees) * mult;

      return {
        label: "Mesh Banner",
        retail,
        each: retail / q,
        cost: directCost,
        profit: retail - directCost,
        margin: retail ? ((retail - directCost) / retail) * 100 : 0,
        totalSqFt,
        materialCost,
        shipping,
        supplierRate,
        polePocketCost,
        ropeCost,
        webbingCost,
        optionsCost,
        costMarginPrice,
        basePrice,
      };
    }

    if (product === "acm") {
      const a = acmOptions[acmType];
      const costEach = Math.max(sqInEach * a.costPerSqIn, a.minCost);
      const layout = sheetLayoutCount(w, h, q, true);
      const sheetsUsed = layout.sheetsUsed;
      const sheetsRounded = layout.sheetsRounded;
      const materialCost = costEach * q;
      const shipping = shippingBySize(w, h, sheetsRounded);
      const directCost = materialCost + shipping;
      const marginCostBase = materialCost;

      let costMarginPrice = marginCostBase / (1 - m);
      let shopPrice = totalSqFt * num(acmSqFtPrice, 18);

      if (acmContour) {
        costMarginPrice *= 1.1;
        shopPrice *= 1.1;
      }

      if (roundedCorners) {
        costMarginPrice += 5;
        shopPrice += 5;
      }

      costMarginPrice += shipping;

      const basePrice = Math.max(costMarginPrice, shopPrice);
      const retail = (basePrice + fees) * mult;

      return {
        label: "ACM / Maxmetal",
        retail,
        each: retail / q,
        cost: directCost,
        profit: retail - directCost,
        margin: retail ? ((retail - directCost) / retail) * 100 : 0,
        totalSqFt,
        materialCost,
        shipping,
        sheetsUsed,
        sheetsRounded,
        piecesPerSheet: layout.piecesPerSheet,
        sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}`,
        costMarginPrice,
        shopPrice,
        basePrice,
      };
    }
    if (product === "acrylic") {
      const costEach = Math.max(sqInEach * acrylicOption.costPerSqIn, acrylicOption.minCost);
      const layout = sheetLayoutCount(w, h, q, true);
      const sheetsRounded = layout.sheetsRounded;
      const materialCost = costEach * q;
      const shipping = shippingBySize(w, h, sheetsRounded);
      const standOff = acrylicStandOffOptions[acrylicStandOffColor];
      const standOffQty = acrylicStandOffs ? Math.max(num(acrylicStandOffQty, 0), 0) : 0;
      const standOffDirectCost = standOffQty * standOff.directEach;
      const standOffRetailCharge = standOffQty * standOff.retailEach;
      const directCost = materialCost + standOffDirectCost + shipping;

      let costMarginPrice = materialCost / (1 - m);
      if (acrylicContour) costMarginPrice *= 1.1;
      if (acrylicRoundedCorners) costMarginPrice += 5;
      costMarginPrice += shipping;

      const retail = (costMarginPrice + standOffRetailCharge + fees) * mult;

      return {
        label: "Acrylic",
        retail,
        each: retail / q,
        cost: directCost,
        profit: retail - directCost,
        margin: retail ? ((retail - directCost) / retail) * 100 : 0,
        totalSqFt,
        materialCost,
        shipping,
        sheetsUsed: layout.sheetsUsed,
        sheetsRounded,
        piecesPerSheet: layout.piecesPerSheet,
        sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}`,
        standOffQty,
        standOffColor: standOff.name,
        standOffDirectCost,
        standOffRetailCharge,
        costMarginPrice,
        basePrice: costMarginPrice + standOffRetailCharge,
      };
    }

    const type = coroDouble ? "double" : "single";
    const scale = w === 18 && h === 12 ? 0.5 : 1;
    const tierEach = getTierPrice(q, type) * scale;
    let tierPrice = tierEach * q;

    if (heavyStakes) tierPrice += q * 2.25;
    if (grommets) tierPrice += q * 0.25 + 15;
    if (gloss) tierPrice += q * 4;
    if (coroContour) tierPrice *= 1.1;
    if (coroRush) tierPrice *= 2;

    const allowRotate = coroFlute === "best";
    const layout = sheetLayoutCount(w, h, q, allowRotate);
    const sheetsUsed = layout.sheetsUsed;
    const sheetsRounded = layout.sheetsRounded;
    const materialCost = getCoroSheetCost(sheetsRounded, type) * sheetsRounded;
    const shipping = shippingBySize(w, h, sheetsRounded);
    const stakeRetail = stakes ? q * 2.0 : 0;
    const stakeCost = stakes ? q * 1.25 : 0;
    const directCost = materialCost + shipping + stakeCost;
    const marginCostBase = materialCost;

    const costMarginPrice = marginCostBase / (1 - m) + shipping;
    const basePrice = Math.max(tierPrice, costMarginPrice);
    const retail = (basePrice + fees) * mult + stakeRetail;

    return {
      label: "Coroplast",
      retail,
      each: retail / q,
      cost: directCost,
      profit: retail - directCost,
      margin: retail ? ((retail - directCost) / retail) * 100 : 0,
      totalSqFt,
      materialCost,
      shipping,
      stakeRetail,
      stakeCost,
      sheetsUsed,
      sheetsRounded,
      piecesPerSheet: layout.piecesPerSheet,
      sheetLayout: `${layout.across} across x ${layout.down} down${layout.rotated ? " (rotated)" : ""}`,
      tierPrice,
      costMarginPrice,
      basePrice,
    };
  }, [
    product,
    width,
    height,
    qty,
    margin,
    multiplier,
    useDesignFee,
    useSetupFee,
    designFee,
    setupFee,
    delivery,
    coroDouble,
    coroFlute,
    stakes,
    heavyStakes,
    grommets,
    gloss,
    coroContour,
    coroRush,
    bannerType,
    polePocket,
    rope,
    windSlits,
    bannerRush,
    meshPolePocket,
    meshGrommets,
    meshWelding,
    meshRope,
    meshWebbing,
    meshRush,
    acmType,
    acmSqFtPrice,
    acmContour,
    roundedCorners,
    acrylicContour,
    acrylicRoundedCorners,
    acrylicStandOffs,
    acrylicStandOffQty,
    acrylicStandOffColor,
    vinylType,
    vinylLaminate,
    vinylContour,
    vinylRush,
    gangVinyl,
    contourPadding,
    gangWastePercent,
    posterRush,
  ]);

  const selectedDetails = {
    product,
    productName: productMap[product]?.label || products[activeProduct] || "Unknown Product",
    size: `${num(width)}" x ${num(height)}"`,
    qty: num(qty, 1),
    material:
      activeProduct === "vinyl"
        ? `${vinylOptions[vinylType].name} / ${vinylLaminate}`
        : activeProduct === "banner"
        ? bannerOptions[bannerType].name
        : activeProduct === "meshBanner"
        ? "Mesh Banner Material"
        : activeProduct === "acm"
        ? acmOptions[acmType].name
        : activeProduct === "poster"
        ? "Poster Paper"
        : activeProduct === "acrylic"
        ? "Acrylic"
        : coroDouble
        ? "4mm Double-Sided Coroplast"
        : activeProduct === "coro"
        ? "4mm Single-Sided Coroplast"
        : "Pricing coming soon",
    options: [
      activeProduct === "vinyl" ? `Vinyl Type: ${vinylOptions[vinylType].name}` : null,
      activeProduct === "vinyl" ? `Laminate: ${vinylLaminate}` : null,
      activeProduct === "banner" ? `Banner Type: ${bannerOptions[bannerType].name}` : null,
      activeProduct === "acm" ? `ACM Type: ${acmOptions[acmType].name}` : null,
      activeProduct === "acrylic" ? "Acrylic Type: Standard" : null,
      activeProduct === "coro" ? (coroDouble ? "Coro: Double-Sided" : "Coro: Single-Sided") : null,
      activeProduct === "vinyl" && vinylContour ? "Contour Cut" : null,
      activeProduct === "vinyl" && vinylRush ? "Rush Order" : null,
      activeProduct === "vinyl" && gangVinyl ? "Gang Vinyl Layout" : null,
      activeProduct === "vinyl" && vinylContour && gangVinyl
        ? `Contour Padding: ${num(contourPadding, 0.5)}"`
        : null,
      activeProduct === "vinyl" && vinylContour && gangVinyl
        ? `Gang Waste: ${num(gangWastePercent, 0)}%`
        : null,
      activeProduct === "coro" ? `Flute Direction: ${coroFlute}` : null,
      activeProduct === "coro" && stakes ? "Standard Stakes" : null,
      activeProduct === "coro" && heavyStakes ? "Heavy Duty Stakes" : null,
      activeProduct === "coro" && grommets ? "Grommets" : null,
      activeProduct === "coro" && gloss ? "Gloss Finish" : null,
      activeProduct === "coro" && coroContour ? "Contour Cut" : null,
      activeProduct === "coro" && coroRush ? "Rush Order" : null,
      activeProduct === "banner" && polePocket ? "Pole Pocket" : null,
      activeProduct === "banner" && rope ? "Rope" : null,
      activeProduct === "banner" && windSlits ? "Wind Slits" : null,
      activeProduct === "banner" && bannerRush ? "Rush Order" : null,
      activeProduct === "meshBanner" && meshPolePocket ? "Pole Pocket" : null,
      activeProduct === "meshBanner" && meshGrommets ? "Grommets" : null,
      activeProduct === "meshBanner" && meshWelding ? "Welding" : null,
      activeProduct === "meshBanner" && meshRope ? "Rope" : null,
      activeProduct === "meshBanner" && meshWebbing ? "Webbing" : null,
      activeProduct === "meshBanner" && meshRush ? "Rush Order" : null,
      activeProduct === "acm" && acmContour ? "Contour Cut" : null,
      activeProduct === "acm" && roundedCorners ? "Rounded Corners" : null,
      activeProduct === "acrylic" && acrylicContour ? "Contour Cut" : null,
      activeProduct === "acrylic" && acrylicRoundedCorners ? "Rounded Corners" : null,
      activeProduct === "acrylic" && acrylicStandOffs
        ? `Stand-Offs: ${Math.max(num(acrylicStandOffQty, 0), 0)} ${acrylicStandOffOptions[acrylicStandOffColor].name}`
        : null,
      activeProduct === "poster" && posterRush ? "Rush Order" : null,
      useDesignFee ? `Design Fee: ${money(num(designFee))}` : null,
      useSetupFee ? `Setup Fee: ${money(num(setupFee))}` : null,
      num(delivery) > 0 ? `Delivery/Install: ${money(num(delivery))}` : null,
      num(multiplier, 1) !== 1 ? `Multiplier: ${num(multiplier, 1)}x` : null,
    ].filter(Boolean),
  };

  return (
    <main className={`appRoot ${theme}`} style={{ fontFamily: "Inter, Arial", minHeight: "100vh", padding: 20 }}>
      <style>{`
        .layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }

        .themeToggle{display:flex;gap:10px;align-items:center;margin:8px 0 14px;}
        .modeBtn{padding:8px 12px;border-radius:999px;border:1px solid #94a3b8;background:linear-gradient(180deg,#fff,#e2e8f0);cursor:pointer;box-shadow:0 3px 8px rgba(15,23,42,.12);}
        .modeBtn.active{background:linear-gradient(180deg,#1d4ed8,#1e293b);color:#fff;border-color:#60a5fa;box-shadow:inset 0 2px 6px rgba(0,0,0,.35),0 0 0 2px rgba(96,165,250,.3);}
        .appRoot.light{background:linear-gradient(160deg,#eff6ff,#f8fafc 45%,#fff);color:#0f172a;}
        .appRoot.dark{background:linear-gradient(160deg,#0b1220,#111827 52%,#1f2937);color:#e2e8f0;}
        .summary {
          background: linear-gradient(160deg,#0f172a,#1e293b);
          color: white;
          box-shadow:0 18px 35px rgba(2,6,23,.35);
          padding: 20px;
          border-radius: 16px;
          box-shadow:0 10px 30px rgba(15,23,42,.09);
        }

        .summary.sticky{position:sticky;top:16px;align-self:start;}
        .card {
          background: rgba(255,255,255,.92);
          padding: 20px;
          border-radius: 16px;
          box-shadow:0 10px 30px rgba(15,23,42,.09);
        }

        .buttonGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .presetBtn, button {
          transition:all .18s ease;
        }
        .presetBtn {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          background: rgba(255,255,255,.92);
          font-size: 14px;
        }

        .presetBtn:hover{transform:translateY(-1px); box-shadow:0 8px 16px rgba(30,64,175,.18);}
        .presetBtn:active{transform:translateY(1px);}
        .comingSoonBtn{opacity:.7;border-style:dashed;}
        .activePreset {
          background: linear-gradient(160deg,#0f172a,#1e293b);
          color: white;
          box-shadow:0 18px 35px rgba(2,6,23,.35);
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px #38bdf8;
          font-weight: 700;
        }

        .resetBtn{margin-top:14px;padding:10px 14px;border-radius:10px;border:1px solid #1e3a8a;background:linear-gradient(180deg,#2563eb,#1d4ed8);color:#fff;font-weight:700;cursor:pointer;}
        .mobilePrice{display:none;flex-direction:column;gap:2px;}
        .mobilePriceTop{display:flex;justify-content:space-between;align-items:center;}
        .mobileMeta{font-size:12px;opacity:.95;line-height:1.25;}
        .mobileOptions{font-size:11px;opacity:.88;line-height:1.25;}
        .optionBox{background:#f8fafc;border:1px solid #e2e8f0;}
        .appRoot.dark .card{background:rgba(15,23,42,.85);color:#e5e7eb;border:1px solid rgba(96,165,250,.25);}
        .appRoot.dark .card h2, .appRoot.dark .card h3, .appRoot.dark .card label, .appRoot.dark .card p{color:#e5e7eb;}
        .appRoot.dark .optionBox{background:rgba(30,41,59,.85);border-color:rgba(148,163,184,.35);}
        .appRoot.dark input, .appRoot.dark select{background:#0f172a;color:#e5e7eb;border:1px solid #334155;}
        .appRoot.dark input::placeholder{color:#94a3b8;}
        .appRoot.dark .presetBtn{background:linear-gradient(180deg,#0f172a,#1e293b);color:#e2e8f0;border-color:#334155;}
        .appRoot.dark .mobilePrice{background:linear-gradient(160deg,#0b1738,#0f172a);color:#f8fafc;border:1px solid rgba(96,165,250,.35);}

        .appRoot.dark .activePreset{
          background:linear-gradient(180deg,#60a5fa,#3b82f6);
          color:#0b1120;
          border-color:#bfdbfe;
          box-shadow:0 0 0 2px rgba(191,219,254,.95),0 10px 20px rgba(59,130,246,.45);
        }
        .appRoot.dark .modeBtn.active{
          background:linear-gradient(180deg,#93c5fd,#60a5fa);
          color:#0b1120;
          border-color:#dbeafe;
          box-shadow:0 0 0 2px rgba(147,197,253,.85), inset 0 1px 2px rgba(255,255,255,.35);
        }

        input, select {
          box-sizing: border-box;
        }

        @media (max-width: 800px) {
          main {
            padding: 10px !important;
          }

          h1 {
            font-size: 30px;
            line-height: 1.1;
          }

          .layout {
            display: flex;
            flex-direction: column;
          }

          .themeToggle{display:flex;gap:10px;align-items:center;margin:8px 0 14px;}
        .modeBtn{padding:8px 12px;border-radius:999px;border:1px solid #94a3b8;background:linear-gradient(180deg,#fff,#e2e8f0);cursor:pointer;box-shadow:0 3px 8px rgba(15,23,42,.12);}
        .modeBtn.active{background:linear-gradient(180deg,#1d4ed8,#1e293b);color:#fff;border-color:#60a5fa;box-shadow:inset 0 2px 6px rgba(0,0,0,.35),0 0 0 2px rgba(96,165,250,.3);}
        .appRoot.light{background:linear-gradient(160deg,#eff6ff,#f8fafc 45%,#fff);color:#0f172a;}
        .appRoot.dark{background:linear-gradient(160deg,#0b1220,#111827 52%,#1f2937);color:#e2e8f0;}
        .summary {
            order: -1;
          }
          .summary.sticky{position:static;}
          .mobilePrice{display:flex;position:fixed;left:10px;right:10px;bottom:10px;z-index:30;background:#0f172a;color:#fff;padding:10px 14px;border-radius:12px;justify-content:space-between;align-items:center;box-shadow:0 10px 20px rgba(0,0,0,.35);}

          .buttonGrid {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .presetBtn, button {
          transition:all .18s ease;
        }
        .presetBtn {
            width: 100%;
            font-size: 15px;
            padding: 10px;
          }

          .formGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <h1>Hue pricing app beta V2</h1>
      <div className="themeToggle">
        <button className={`modeBtn ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>Light Mode</button>
        <button className={`modeBtn ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>Dark Mode</button>
      </div>
      <p>Live quote calculator for signs, banners, ACM, vinyl, and poster paper.</p>

      <div className="layout">
        <section className="card">
          <h2>Product Categories</h2>
          {productCategories.map((category) => (
            <Box key={category.name} title={category.name}>
              <div className="buttonGrid">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    className={`presetBtn ${product === item.id ? "activePreset" : ""} ${item.calculator ? "" : "comingSoonBtn"}`}
                    onClick={() => setProduct(item.id)}
                  >
                    {item.label} {!item.calculator ? "• Coming Soon" : ""}
                  </button>
                ))}
              </div>
            </Box>
          ))}

          <h2>Custom Presets</h2>
          <label>Preset Product</label>
          <select
            style={input}
            value={presetProduct}
            onChange={(e) => {
              const nextProduct = e.target.value;
              setPresetProduct(nextProduct);
              setProduct(nextProduct);
            }}
          >
            {Object.entries(products).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>

          <div className="buttonGrid" style={{ marginTop: 12 }}>
            {(presetGroups[presetProduct] || []).map((p) => (
              <button
                key={`${presetProduct}-${p.label}`}
                className={presetClass(presetProduct, p.w, p.h, p.double || false)}
                onClick={() => preset(presetProduct, p.w, p.h, p.double || false)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <h2>Quote Details</h2>

          <label>Product</label>
          <select style={input} value={product} onChange={(e) => setProduct(e.target.value)}>
            {productCategories.map((category) => (
              <optgroup key={category.name} label={category.name}>
                {category.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}{item.calculator ? "" : " (Coming Soon)"}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {activeProduct === "vinyl" && (
            <Box title="Printed Vinyl Options">
              <label>Vinyl Type</label>
              <select style={input} value={vinylType} onChange={(e) => setVinylType(e.target.value)}>
                {Object.entries(vinylOptions).map(([key, v]) => (
                  <option key={key} value={key}>
                    {v.name} — {money(v.retail)}/sq ft
                  </option>
                ))}
              </select>

              <label>Laminate</label>
              <select style={input} value={vinylLaminate} onChange={(e) => setVinylLaminate(e.target.value)}>
                <option>Gloss Laminate</option>
                <option>Matte Laminate</option>
                <option>No Laminate</option>
              </select>

              <Check label="Contour Cut (+10%)" value={vinylContour} setValue={setVinylContour} />
              <Check label="Rush Order (2x)" value={vinylRush} setValue={setVinylRush} />
              <Check label="Gang Vinyl Layout" value={gangVinyl} setValue={setGangVinyl} />

              {vinylContour && gangVinyl && (
                <div className="formGrid" style={grid}>
                  <Field label="Contour Padding Inches" value={contourPadding} setValue={setContourPadding} />
                  <Field label="Gang Waste %" value={gangWastePercent} setValue={setGangWastePercent} />
                </div>
              )}
            </Box>
          )}

          {activeProduct === "coro" && (
            <Box title="Coro Options">
              <label>Flute Direction</label>
              <select style={input} value={coroFlute} onChange={(e) => setCoroFlute(e.target.value)}>
                <option value="vertical">Vertical Flutes / Stakes</option>
                <option value="horizontal">Horizontal Flutes</option>
                <option value="best">Best Fit / Does Not Matter</option>
              </select>

              <Check label="Double Sided" value={coroDouble} setValue={setCoroDouble} />
              <Check label="Standard Stakes" value={stakes} setValue={setStakes} />
              <Check label="Heavy Duty Stakes" value={heavyStakes} setValue={setHeavyStakes} />
              <Check label="Grommets" value={grommets} setValue={setGrommets} />
              <Check label="Gloss Finish" value={gloss} setValue={setGloss} />
              <Check label="Contour Cut (+10%)" value={coroContour} setValue={setCoroContour} />
              <Check label="Rush Order (2x)" value={coroRush} setValue={setCoroRush} />
            </Box>
          )}

          {activeProduct === "banner" && (
            <Box title="Banner Options">
              <label>Banner Material</label>
              <select style={input} value={bannerType} onChange={(e) => setBannerType(e.target.value)}>
                {Object.entries(bannerOptions).map(([key, b]) => (
                  <option key={key} value={key}>{b.name} — {money(b.retail)}/sq ft</option>
                ))}
              </select>
              <Check label="Pole Pocket" value={polePocket} setValue={setPolePocket} />
              <Check label="Rope" value={rope} setValue={setRope} />
              <Check label="Wind Slits" value={windSlits} setValue={setWindSlits} />
              <Check label="Rush Order (2x)" value={bannerRush} setValue={setBannerRush} />
            </Box>
          )}

          {activeProduct === "acm" && (
            <Box title="ACM Options">
              <label>ACM Type</label>
              <select style={input} value={acmType} onChange={(e) => setAcmType(e.target.value)}>
                {Object.entries(acmOptions).map(([key, a]) => (
                  <option key={key} value={key}>{a.name}</option>
                ))}
              </select>
              <Field label="Shop $ Per Sq Ft" value={acmSqFtPrice} setValue={setAcmSqFtPrice} />
              <Check label="Contour Cut (+10%)" value={acmContour} setValue={setAcmContour} />
              <Check label="Rounded Corners (+$5)" value={roundedCorners} setValue={setRoundedCorners} />
            </Box>
          )}
          {activeProduct === "acrylic" && (
            <Box title="Acrylic Options">
              <Check label="Contour Cut (+10%)" value={acrylicContour} setValue={setAcrylicContour} />
              <Check label="Rounded Corners (+$5)" value={acrylicRoundedCorners} setValue={setAcrylicRoundedCorners} />
              <Check label="Enable Stand-Offs" value={acrylicStandOffs} setValue={setAcrylicStandOffs} />
              {acrylicStandOffs && (
                <div className="formGrid" style={grid}>
                  <Field label="Stand-Off Quantity" value={acrylicStandOffQty} setValue={setAcrylicStandOffQty} />
                  <div>
                    <label>Stand-Off Color</label>
                    <select style={input} value={acrylicStandOffColor} onChange={(e) => setAcrylicStandOffColor(e.target.value)}>
                      <option value="silver">Silver</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>
              )}
            </Box>
          )}

          {activeProduct === "meshBanner" && (
            <Box title="Mesh Banner Options">
              <Check label="Pole Pocket (+$1/linear ft + $10 setup)" value={meshPolePocket} setValue={setMeshPolePocket} />
              <Check label="Grommets (No additional cost)" value={meshGrommets} setValue={setMeshGrommets} />
              <Check label="Welding (No additional cost)" value={meshWelding} setValue={setMeshWelding} />
              <Check label="Rope (+$1/linear ft)" value={meshRope} setValue={setMeshRope} />
              <Check label="Webbing (+$1/linear ft)" value={meshWebbing} setValue={setMeshWebbing} />
              <Check label="Rush Order (2x)" value={meshRush} setValue={setMeshRush} />
            </Box>
          )}

          {activeProduct === "poster" && (
            <Box title="Poster Paper Options">
              <Check label="Rush Order (2x)" value={posterRush} setValue={setPosterRush} />
            </Box>
          )}

          <div className="formGrid" style={grid}>
            <Field label="Quantity" value={qty} setValue={setQty} />
            <Field label="Width Inches" value={width} setValue={setWidth} />
            <Field label="Height Inches" value={height} setValue={setHeight} />
            <Field label="Margin %" value={margin} setValue={setMargin} />
            <Field label="Delivery / Install" value={delivery} setValue={setDelivery} />
            <Field label="Price Multiplier" value={multiplier} setValue={setMultiplier} />
          </div>

          <button className="resetBtn" onClick={resetAll}>Reset to Defaults</button>

          <Box title="Optional Fees">
            <Check label="Add Design Fee" value={useDesignFee} setValue={setUseDesignFee} />
            {useDesignFee && <Field label="Design Fee" value={designFee} setValue={setDesignFee} />}
            <Check label="Add Setup Fee" value={useSetupFee} setValue={setUseSetupFee} />
            {useSetupFee && <Field label="Setup Fee" value={setupFee} setValue={setSetupFee} />}
          </Box>
        </section>

        <aside className="summary sticky">
          <h2>Suggested Retail</h2>
          <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(calc.retail)}</div>
          <p>Each: <strong>{money(calc.each)}</strong></p>
          <p>Profit: <strong>{money(calc.profit)}</strong></p>
          <hr />
          <p>Product: {calc.label}</p>
          <p>Total Sq Ft: {calc.totalSqFt?.toFixed(2)}</p>

          <button className="modeBtn" style={{marginBottom:10}} onClick={() => setShowBreakdown((v) => !v)}>{showBreakdown ? "Hide" : "Show"} Detailed Breakdown</button>

          {showBreakdown && calc.actualTotalSqFt !== undefined && <p>Actual Sq Ft: {calc.actualTotalSqFt.toFixed(2)}</p>}
          {showBreakdown && calc.effectiveSqFtEach !== undefined && <p>Effective Sq Ft Each: {showBreakdown && calc.effectiveSqFtEach.toFixed(2)}</p>}
          {showBreakdown && calc.billableSqFtEach !== undefined && <p>Billable Sq Ft Each: {showBreakdown && calc.billableSqFtEach.toFixed(2)}</p>}
          {showBreakdown && calc.layoutWidth !== undefined && calc.layoutHeight !== undefined && (
            <p>Layout Size: {showBreakdown && calc.layoutWidth}" x {calc.layoutHeight}"</p>
          )}
          {showBreakdown && calc.rawBillableSqFt !== undefined && <p>Raw Gang Sq Ft: {showBreakdown && calc.rawBillableSqFt.toFixed(2)}</p>}
          {showBreakdown && calc.billingMode !== undefined && <p>Billing Mode: {showBreakdown && calc.billingMode}</p>}
          {showBreakdown && calc.normalSqFt !== undefined && <p>Normal Layout Sq Ft: {showBreakdown && calc.normalSqFt.toFixed(2)}</p>}
          {calc.rotatedSqFt !== undefined && <p>Rotated Layout Sq Ft: {calc.rotatedSqFt.toFixed(2)}</p>}

          {showBreakdown && calc.tierPrice !== undefined && <p>Tier Price Total: {money(calc.tierPrice)}</p>}
          {showBreakdown && calc.costMarginPrice !== undefined && <p>Cost + Margin Price: {money(calc.costMarginPrice)}</p>}
          {showBreakdown && calc.shopPrice !== undefined && <p>Shop Sq Ft Price: {money(calc.shopPrice)}</p>}
          {showBreakdown && calc.sheetsUsed !== undefined && <p>Sheets Used: {showBreakdown && calc.sheetsUsed.toFixed(2)}</p>}
          {showBreakdown && calc.sheetsRounded !== undefined && <p>Sheets Rounded: {showBreakdown && calc.sheetsRounded}</p>}
          {showBreakdown && calc.piecesPerSheet !== undefined && <p>Pieces Per Sheet: {showBreakdown && calc.piecesPerSheet}</p>}
          {showBreakdown && calc.sheetLayout !== undefined && <p>Sheet Layout: {showBreakdown && calc.sheetLayout}</p>}
          <p>Material Cost: {money(calc.materialCost)}</p>
          {calc.standOffQty !== undefined && calc.standOffQty > 0 && (
            <>
              <p>Stand-Off Qty: {calc.standOffQty} ({calc.standOffColor})</p>
              <p>Stand-Off Direct Cost: {money(calc.standOffDirectCost)}</p>
              <p>Stand-Off Retail Charge: {money(calc.standOffRetailCharge)}</p>
            </>
          )}
          <p>Shipping: {money(calc.shipping)}</p>
          <p>Direct Cost: {money(calc.cost)}</p>
          <p>Actual Margin: {calc.margin.toFixed(1)}%</p>
          <p>Multiplier: {num(multiplier, 1)}x</p>

          <ProductVisual product={activeProduct || product} comingSoon={!activeProduct} />
          {activeProduct === "vinyl" && <VinylLayoutPreview calc={calc} />}
          <SelectedDetails details={selectedDetails} />
        </aside>
      </div>
      <div className="mobilePrice">
        <div className="mobilePriceTop"><strong>Suggested Retail {money(calc.retail).replace("$", "$ ")}</strong></div>
        <div className="mobileMeta">{productMap[product]?.label || products[activeProduct]} • {num(width)}&quot; x {num(height)}&quot; • Qty {num(qty, 1)}</div>
        <div className="mobileOptions">{selectedDetails.options.length ? `Options: ${selectedDetails.options.join(", ")}` : "Options: None"}</div>
      </div>
    </main>
  );
}

const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 };
const input = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ccc", fontSize: 16 };

function Field({ label, value, setValue }) {
  return (
    <div>
      <label>{label}</label>
      <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" style={input} />
    </div>
  );
}

function Check({ label, value, setValue }) {
  return (
    <label style={{ display: "block", marginTop: 12 }}>
      <input type="checkbox" checked={value} onChange={(e) => setValue(e.target.checked)} /> {label}
    </label>
  );
}

function Box({ title, children }) {
  return (
    <div className="optionBox" style={{ marginTop: 20, padding: 15, borderRadius: 12 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function ProductVisual({ product, comingSoon }) {
  if (comingSoon) {
    return <div style={visualBox}><p style={visualLabel}>Pricing coming soon for this product.</p></div>;
  }
  if (product === "coro") {
    return (
      <div style={visualBox}>
        <div style={coroSign}>
          <div style={signPanel}>CORO</div>
          <div style={stakeLeft}></div>
          <div style={stakeRight}></div>
        </div>
        <p style={visualLabel}>Coroplast Yard Sign Selected</p>
      </div>
    );
  }

  if (product === "banner") {
    return (
      <div style={visualBox}>
        <div style={bannerVisual}>BANNER</div>
        <p style={visualLabel}>Vinyl Banner Selected</p>
      </div>
    );
  }

  if (product === "vinyl") {
    return (
      <div style={visualBox}>
        <div style={vinylVisual}>VINYL</div>
        <p style={visualLabel}>Printed Vinyl Selected</p>
      </div>
    );
  }

  if (product === "poster") {
    return (
      <div style={visualBox}>
        <div style={posterVisual}>POSTER</div>
        <p style={visualLabel}>Poster Paper Selected</p>
      </div>
    );
  }

  if (product === "meshBanner") {
    return (
      <div style={visualBox}>
        <div style={meshBannerVisual}>MESH</div>
        <p style={visualLabel}>Mesh Banner Selected</p>
      </div>
    );
  }

  if (product === "acm") {
    return (
      <div style={visualBox}>
        <div style={acmVisual}>ACM</div>
        <p style={visualLabel}>ACM / Maxmetal Selected</p>
      </div>
    );
  }
  if (product === "acrylic") {
    return (
      <div style={visualBox}>
        <div style={acrylicVisual}>ACRYLIC</div>
        <p style={visualLabel}>Acrylic Selected</p>
      </div>
    );
  }

  return null;
}

function VinylLayoutPreview({ calc }) {
  if (!calc.piecesAcross || !calc.rows || !calc.pieceW || !calc.pieceH) return null;

  const scale = 3;
  const rollW = 52 * scale;
  const boxW = calc.pieceW * scale;
  const boxH = calc.pieceH * scale;

  return (
    <div style={previewBox}>
      <h4 style={{ marginTop: 0, marginBottom: 10 }}>Layout Preview</h4>

      <div style={{ fontSize: 12, marginBottom: 8, color: "#cbd5e1" }}>
        52" roll width • {calc.layoutHeight}" long
      </div>

      <div style={{ width: rollW, maxWidth: "100%", overflowX: "auto", border: "2px solid #38bdf8", padding: 5 }}>
        {Array.from({ length: calc.rows }).map((_, row) => (
          <div key={row} style={{ display: "flex" }}>
            {Array.from({ length: calc.piecesAcross }).map((_, col) => (
              <div
                key={col}
                title={`${calc.pieceW.toFixed(1)}" x ${calc.pieceH.toFixed(1)}"`}
                style={{
                  width: boxW,
                  height: boxH,
                  border: "1px dashed #94a3b8",
                  margin: 2,
                  background: "rgba(255,255,255,0.08)",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <p style={{ marginTop: 10, fontSize: 13 }}>{calc.billingMode}</p>
    </div>
  );
}

function SelectedDetails({ details }) {
  return (
    <div style={detailsBox}>
      <h3 style={{ marginTop: 0 }}>Selected Details</h3>
      <p><strong>Product:</strong> {details.productName}</p>
      <p><strong>Size:</strong> {details.size}</p>
      <p><strong>Quantity:</strong> {details.qty}</p>
      <p><strong>Material:</strong> {details.material}</p>
      <p><strong>Options:</strong> {details.options.length ? details.options.join(", ") : "None"}</p>
    </div>
  );
}

const visualBox = {
  marginTop: 25,
  padding: 18,
  borderRadius: 16,
  background: "rgba(255,255,255,0.08)",
  textAlign: "center",
};

const previewBox = {
  marginTop: 20,
  padding: 15,
  background: "rgba(255,255,255,0.05)",
  borderRadius: 12,
};

const detailsBox = {
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.08)",
  color: "#e5e7eb",
  fontSize: 14,
  lineHeight: 1.35,
};

const visualLabel = { marginTop: 12, fontSize: 14, color: "#cbd5e1" };
const coroSign = { display: "inline-block", position: "relative", height: 120, width: 180 };

const signPanel = {
  background: "white",
  color: "#0f172a",
  borderRadius: 8,
  padding: "28px 10px",
  fontSize: 30,
  fontWeight: "bold",
  border: "4px solid #38bdf8",
};

const stakeLeft = { position: "absolute", left: 55, top: 80, width: 5, height: 55, background: "#94a3b8" };
const stakeRight = { position: "absolute", right: 55, top: 80, width: 5, height: 55, background: "#94a3b8" };

const bannerVisual = {
  display: "inline-block",
  background: "white",
  color: "#0f172a",
  borderRadius: 8,
  padding: "30px 45px",
  fontSize: 28,
  fontWeight: "bold",
  borderTop: "8px solid #38bdf8",
  borderBottom: "8px solid #38bdf8",
};

const vinylVisual = {
  display: "inline-block",
  background: "linear-gradient(135deg, #ffffff, #dbeafe)",
  color: "#0f172a",
  borderRadius: 8,
  padding: "30px 45px",
  fontSize: 28,
  fontWeight: "bold",
  border: "4px dashed #38bdf8",
};


const posterVisual = {
  display: "inline-block",
  background: "linear-gradient(135deg, #f8fafc, #cbd5e1)",
  color: "#0b1f4d",
  borderRadius: 10,
  padding: "28px 36px",
  fontSize: 30,
  fontWeight: "bold",
  border: "4px solid rgba(255,255,255,0.9)",
  boxShadow: "inset 0 0 16px rgba(0,0,0,.12)",
};

const acmVisual = {
  display: "inline-block",
  background: "linear-gradient(135deg, #e5e7eb, #94a3b8)",
  color: "#0f172a",
  borderRadius: 10,
  padding: "35px 55px",
  fontSize: 34,
  fontWeight: "bold",
  border: "4px solid white",
  boxShadow: "inset 0 0 20px rgba(0,0,0,.2)",
};

const meshBannerVisual = {
  display: "inline-block",
  background: "repeating-linear-gradient(45deg, #dbeafe, #dbeafe 8px, #bfdbfe 8px, #bfdbfe 16px)",
  color: "#0f172a",
  borderRadius: 8,
  padding: "30px 45px",
  fontSize: 28,
  fontWeight: "bold",
  border: "4px solid #38bdf8",
};

const acrylicVisual = {
  display: "inline-block",
  background: "linear-gradient(135deg, rgba(186,230,253,.8), rgba(224,242,254,.45))",
  color: "#0f172a",
  borderRadius: 10,
  padding: "34px 44px",
  fontSize: 30,
  fontWeight: "bold",
  border: "3px solid rgba(125,211,252,.9)",
  boxShadow: "inset 0 0 18px rgba(14,116,144,.18)",
};
