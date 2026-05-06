"use client";

import { useEffect, useMemo, useState } from "react";
import ProductVisual from "../components/ProductVisual";
import VinylLayoutPreview from "../components/VinylLayoutPreview";
import SheetLayoutPreview from "../components/SheetLayoutPreview";
import ProductOptions from "../components/ProductOptions";
import { Box, Check, Field, SelectedDetails, input } from "../components/FormControls";
import { money, num, getFoamcoreSheetPrice, getPvcSheetPrice, getTierPrice, getCoroSheetCost, shippingBySize, sheetLayoutCount, getVinylBillableSqFt } from "../utils/pricingHelpers";
import { products, acrylicOption, acrylicStandOffOptions, productCategories, bannerOptions, acmOptions, vinylOptions, coroPricing, coroSheetCost, foamcoreSheetPricing, pvcSheetPricing, pvcOptions } from "../data/productConfig";

const productMap = Object.fromEntries(productCategories.flatMap((c) => c.items.map((i) => [i.id, i])));
const allProducts = productCategories.flatMap((c) => c.items.map((i) => ({ ...i, category: c.name })));

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
  const [foamcoreDouble, setFoamcoreDouble] = useState(false);
  const [foamcoreContour, setFoamcoreContour] = useState(false);
  const [foamcoreGloss, setFoamcoreGloss] = useState(false);
  const [foamcoreRush, setFoamcoreRush] = useState(false);
  const [foamcoreCustomCut, setFoamcoreCustomCut] = useState(false);
  const [pvcType, setPvcType] = useState("3-single");
  const [pvcContour, setPvcContour] = useState(false);
  const [pvcRush, setPvcRush] = useState(false);
  const [pvcCustomCut, setPvcCustomCut] = useState(false);
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
    setFoamcoreDouble(false); setFoamcoreContour(false); setFoamcoreGloss(false); setFoamcoreRush(false); setFoamcoreCustomCut(false);
    setPvcType("3-single"); setPvcContour(false); setPvcRush(false); setPvcCustomCut(false);
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
    foamcore: [
      { label: "12x18", w: 12, h: 18 }, { label: "18x24", w: 18, h: 24 }, { label: "24x36", w: 24, h: 36 },
      { label: "24x48", w: 24, h: 48 }, { label: "32x48", w: 32, h: 48 },
    ],
    pvc: [
      { label: "12x18", w: 12, h: 18 }, { label: "18x24", w: 18, h: 24 }, { label: "24x36", w: 24, h: 36 },
      { label: "24x48", w: 24, h: 48 }, { label: "32x48", w: 32, h: 48 }, { label: "36x48", w: 36, h: 48 },
      { label: "48x48", w: 48, h: 48 },
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

    if (product === "foamcore") {
      const layout = sheetLayoutCount(w, h, q, true);
      const sheetsUsed = Math.max(layout.sheetsUsed, 1);
      const sheetsRounded = Math.max(layout.sheetsRounded, 1);
      const sheetPrice = getFoamcoreSheetPrice(sheetsRounded, foamcoreDouble, foamcoreSheetPricing);
      const materialCost = sheetsRounded * sheetPrice;
      const shipping = shippingBySize(w, h, sheetsRounded);
      const directCost = materialCost + shipping;
      const marginCostBase = materialCost;
      const costPerPiece = materialCost / q;

      let costMarginPrice = marginCostBase / (1 - m);
      if (foamcoreContour) costMarginPrice *= 1.1;
      if (foamcoreGloss) costMarginPrice += q * 4;
      if (foamcoreRush) costMarginPrice *= 2;
      costMarginPrice += shipping;

      const basePrice = costMarginPrice;
      const retail = (basePrice + fees) * mult;

      return {
        label: "Foamcore",
        quantity: q,
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
        sheetAcross: layout.across,
        sheetDown: layout.down,
        sheetRotated: layout.rotated,
        previewPieceW: layout.rotated ? h : w,
        previewPieceH: layout.rotated ? w : h,
        sheetPrice,
        costPerPiece,
        costMarginPrice,
        basePrice,
      };
    }

    if (product === "pvc") {
      const layout = sheetLayoutCount(w, h, q, true);
      const sheetsUsed = Math.max(layout.sheetsUsed, 1);
      const sheetsRounded = Math.max(layout.sheetsRounded, 1);
      const sheetPrice = getPvcSheetPrice(sheetsRounded, pvcType, pvcSheetPricing);
      const materialCost = sheetsRounded * sheetPrice;
      const shipping = shippingBySize(w, h, sheetsRounded);
      const directCost = materialCost + shipping;
      const costPerPiece = materialCost / q;

      let costMarginPrice = materialCost / (1 - m);
      if (pvcContour) costMarginPrice *= 1.1;
      if (pvcRush) costMarginPrice *= 2;
      costMarginPrice += shipping;

      const basePrice = costMarginPrice;
      const retail = (basePrice + fees) * mult;

      return {
        label: "PVC",
        quantity: q,
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
        sheetAcross: layout.across,
        sheetDown: layout.down,
        sheetRotated: layout.rotated,
        previewPieceW: layout.rotated ? h : w,
        previewPieceH: layout.rotated ? w : h,
        sheetPrice,
        costPerPiece,
        pvcType: pvcOptions[pvcType].name,
        costMarginPrice,
        basePrice,
      };
    }

    const type = coroDouble ? "double" : "single";
    const scale = w === 18 && h === 12 ? 0.5 : 1;
    const tierEach = getTierPrice(q, type, coroPricing) * scale;
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
    const materialCost = getCoroSheetCost(sheetsRounded, type, coroSheetCost) * sheetsRounded;
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
    foamcoreDouble,
    foamcoreContour,
    foamcoreGloss,
    foamcoreRush,
    foamcoreCustomCut,
    pvcType,
    pvcContour,
    pvcRush,
    pvcCustomCut,
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
        : activeProduct === "foamcore"
        ? foamcoreDouble ? "Foamcore Double-Sided" : "Foamcore Single-Sided"
        : activeProduct === "pvc"
        ? pvcOptions[pvcType].name
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
      activeProduct === "foamcore" ? (foamcoreDouble ? "Foamcore: Double-Sided" : "Foamcore: Single-Sided") : null,
      activeProduct === "foamcore" && foamcoreContour ? "Contour Cut" : null,
      activeProduct === "foamcore" && foamcoreGloss ? "Gloss Finish" : null,
      activeProduct === "foamcore" && foamcoreRush ? "Rush Order" : null,
      activeProduct === "foamcore" && foamcoreCustomCut ? "Custom Cut" : null,
      activeProduct === "pvc" ? `PVC Type: ${pvcOptions[pvcType].name}` : null,
      activeProduct === "pvc" && pvcContour ? "Contour Cut" : null,
      activeProduct === "pvc" && pvcRush ? "Rush Order" : null,
      activeProduct === "pvc" && pvcCustomCut ? "Custom Cut" : null,
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

                    <ProductOptions
            activeProduct={activeProduct}
            grid={grid}
            vinylType={vinylType}
            setVinylType={setVinylType}
            vinylLaminate={vinylLaminate}
            setVinylLaminate={setVinylLaminate}
            vinylContour={vinylContour}
            setVinylContour={setVinylContour}
            vinylRush={vinylRush}
            setVinylRush={setVinylRush}
            gangVinyl={gangVinyl}
            setGangVinyl={setGangVinyl}
            contourPadding={contourPadding}
            setContourPadding={setContourPadding}
            gangWastePercent={gangWastePercent}
            setGangWastePercent={setGangWastePercent}
            coroFlute={coroFlute}
            setCoroFlute={setCoroFlute}
            coroDouble={coroDouble}
            setCoroDouble={setCoroDouble}
            stakes={stakes}
            setStakes={setStakes}
            heavyStakes={heavyStakes}
            setHeavyStakes={setHeavyStakes}
            grommets={grommets}
            setGrommets={setGrommets}
            gloss={gloss}
            setGloss={setGloss}
            coroContour={coroContour}
            setCoroContour={setCoroContour}
            coroRush={coroRush}
            setCoroRush={setCoroRush}
            bannerType={bannerType}
            setBannerType={setBannerType}
            polePocket={polePocket}
            setPolePocket={setPolePocket}
            rope={rope}
            setRope={setRope}
            windSlits={windSlits}
            setWindSlits={setWindSlits}
            bannerRush={bannerRush}
            setBannerRush={setBannerRush}
            acmType={acmType}
            setAcmType={setAcmType}
            acmSqFtPrice={acmSqFtPrice}
            setAcmSqFtPrice={setAcmSqFtPrice}
            acmContour={acmContour}
            setAcmContour={setAcmContour}
            roundedCorners={roundedCorners}
            setRoundedCorners={setRoundedCorners}
            acrylicContour={acrylicContour}
            setAcrylicContour={setAcrylicContour}
            acrylicRoundedCorners={acrylicRoundedCorners}
            setAcrylicRoundedCorners={setAcrylicRoundedCorners}
            acrylicStandOffs={acrylicStandOffs}
            setAcrylicStandOffs={setAcrylicStandOffs}
            acrylicStandOffQty={acrylicStandOffQty}
            setAcrylicStandOffQty={setAcrylicStandOffQty}
            acrylicStandOffColor={acrylicStandOffColor}
            setAcrylicStandOffColor={setAcrylicStandOffColor}
            meshPolePocket={meshPolePocket}
            setMeshPolePocket={setMeshPolePocket}
            meshGrommets={meshGrommets}
            setMeshGrommets={setMeshGrommets}
            meshWelding={meshWelding}
            setMeshWelding={setMeshWelding}
            meshRope={meshRope}
            setMeshRope={setMeshRope}
            meshWebbing={meshWebbing}
            setMeshWebbing={setMeshWebbing}
            meshRush={meshRush}
            setMeshRush={setMeshRush}
            posterRush={posterRush}
            setPosterRush={setPosterRush}
            foamcoreDouble={foamcoreDouble}
            setFoamcoreDouble={setFoamcoreDouble}
            foamcoreContour={foamcoreContour}
            setFoamcoreContour={setFoamcoreContour}
            foamcoreGloss={foamcoreGloss}
            setFoamcoreGloss={setFoamcoreGloss}
            foamcoreRush={foamcoreRush}
            setFoamcoreRush={setFoamcoreRush}
            foamcoreCustomCut={foamcoreCustomCut}
            setFoamcoreCustomCut={setFoamcoreCustomCut}
            pvcType={pvcType}
            setPvcType={setPvcType}
            pvcContour={pvcContour}
            setPvcContour={setPvcContour}
            pvcRush={pvcRush}
            setPvcRush={setPvcRush}
            pvcCustomCut={pvcCustomCut}
            setPvcCustomCut={setPvcCustomCut}
          />


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
          {showBreakdown && calc.costPerPiece !== undefined && <p>Cost Per Piece: {money(calc.costPerPiece)}</p>}
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
          {(activeProduct === "foamcore" || activeProduct === "pvc") && <SheetLayoutPreview calc={calc} />}
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

const foamcoreVisual = {
  display: "inline-block",
  background: "linear-gradient(135deg, #fef3c7, #fde68a)",
  color: "#422006",
  borderRadius: 10,
  padding: "32px 42px",
  fontSize: 28,
  fontWeight: "bold",
  border: "4px solid #f59e0b",
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

const pvcVisual = {
  display: "inline-block",
  background: "linear-gradient(135deg, #ecfeff, #bae6fd)",
  color: "#082f49",
  borderRadius: 10,
  padding: "34px 44px",
  fontSize: 30,
  fontWeight: "bold",
  border: "3px solid #0ea5e9",
};
