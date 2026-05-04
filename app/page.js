"use client";

import { useMemo, useState } from "react";

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
  acm: "ACM / Maxmetal",
  vinyl: "Printed Vinyl",
};

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
  const [qty, setQty] = useState(10);
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

  const [acmType, setAcmType] = useState("3-single");
  const [acmSqFtPrice, setAcmSqFtPrice] = useState(18);
  const [acmContour, setAcmContour] = useState(false);
  const [roundedCorners, setRoundedCorners] = useState(false);

  const [vinylType, setVinylType] = useState("gf-standard");
  const [vinylLaminate, setVinylLaminate] = useState("Gloss Laminate");
  const [vinylContour, setVinylContour] = useState(false);
  const [vinylRush, setVinylRush] = useState(false);
  const [gangVinyl, setGangVinyl] = useState(false);
  const [contourPadding, setContourPadding] = useState(0.5);
  const [gangWastePercent, setGangWastePercent] = useState(15);

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
      const cost = materialCost + shipping;

      let shopPrice = vinylSqFt.totalBillable * v.retail;
      let costMarginPrice = cost / (1 - m);

      if (vinylContour) {
        shopPrice *= 1.1;
        costMarginPrice *= 1.1;
      }

      if (vinylRush) {
        shopPrice *= 2;
        costMarginPrice *= 2;
      }

      const basePrice = Math.max(shopPrice, costMarginPrice);
      const retail = (basePrice + fees) * mult;

      return {
        label: "Printed Vinyl",
        retail,
        each: retail / q,
        cost,
        profit: retail - cost,
        margin: retail ? ((retail - cost) / retail) * 100 : 0,
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

    if (product === "acm") {
      const a = acmOptions[acmType];
      const costEach = Math.max(sqInEach * a.costPerSqIn, a.minCost);
      const layout = sheetLayoutCount(w, h, q, true);
      const sheetsUsed = layout.sheetsUsed;
      const sheetsRounded = layout.sheetsRounded;
      const materialCost = costEach * q;
      const shipping = shippingBySize(w, h, sheetsRounded);
      const cost = materialCost + shipping;

      let costMarginPrice = cost / (1 - m);
      let shopPrice = totalSqFt * num(acmSqFtPrice, 18);

      if (acmContour) {
        costMarginPrice *= 1.1;
        shopPrice *= 1.1;
      }

      if (roundedCorners) {
        costMarginPrice += 5;
        shopPrice += 5;
      }

      const basePrice = Math.max(costMarginPrice, shopPrice);
      const retail = (basePrice + fees) * mult;

      return {
        label: "ACM / Maxmetal",
        retail,
        each: retail / q,
        cost,
        profit: retail - cost,
        margin: retail ? ((retail - cost) / retail) * 100 : 0,
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
    const cost = materialCost + shipping + stakeCost;

    const costMarginPrice = (materialCost + shipping) / (1 - m);
    const basePrice = Math.max(tierPrice, costMarginPrice);
    const retail = (basePrice + fees) * mult + stakeRetail;

    return {
      label: "Coroplast",
      retail,
      each: retail / q,
      cost,
      profit: retail - cost,
      margin: retail ? ((retail - cost) / retail) * 100 : 0,
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
    acmType,
    acmSqFtPrice,
    acmContour,
    roundedCorners,
    vinylType,
    vinylLaminate,
    vinylContour,
    vinylRush,
    gangVinyl,
    contourPadding,
    gangWastePercent,
  ]);

  const selectedDetails = {
    product,
    productName: products[product],
    size: `${num(width)}" x ${num(height)}"`,
    qty: num(qty, 1),
    material:
      product === "vinyl"
        ? `${vinylOptions[vinylType].name} / ${vinylLaminate}`
        : product === "banner"
        ? bannerOptions[bannerType].name
        : product === "acm"
        ? acmOptions[acmType].name
        : coroDouble
        ? "4mm Double-Sided Coroplast"
        : "4mm Single-Sided Coroplast",
    options: [
      product === "vinyl" && vinylContour ? "Contour Cut" : null,
      product === "vinyl" && vinylRush ? "Rush Order" : null,
      product === "vinyl" && gangVinyl ? "Gang Vinyl Layout" : null,
      product === "vinyl" && vinylContour && gangVinyl
        ? `Contour Padding: ${num(contourPadding, 0.5)}"`
        : null,
      product === "vinyl" && vinylContour && gangVinyl
        ? `Gang Waste: ${num(gangWastePercent, 0)}%`
        : null,
      product === "coro" ? `Flute Direction: ${coroFlute}` : null,
      product === "coro" && stakes ? "Standard Stakes" : null,
      product === "coro" && heavyStakes ? "Heavy Duty Stakes" : null,
      product === "coro" && grommets ? "Grommets" : null,
      product === "coro" && gloss ? "Gloss Finish" : null,
      product === "coro" && coroContour ? "Contour Cut" : null,
      product === "coro" && coroRush ? "Rush Order" : null,
      product === "banner" && polePocket ? "Pole Pocket" : null,
      product === "banner" && rope ? "Rope" : null,
      product === "banner" && windSlits ? "Wind Slits" : null,
      product === "banner" && bannerRush ? "Rush Order" : null,
      product === "acm" && acmContour ? "Contour Cut" : null,
      product === "acm" && roundedCorners ? "Rounded Corners" : null,
      useDesignFee ? `Design Fee: ${money(num(designFee))}` : null,
      useSetupFee ? `Setup Fee: ${money(num(setupFee))}` : null,
      num(delivery) > 0 ? `Delivery/Install: ${money(num(delivery))}` : null,
      num(multiplier, 1) !== 1 ? `Multiplier: ${num(multiplier, 1)}x` : null,
    ].filter(Boolean),
  };

  return (
    <main style={{ fontFamily: "Arial", background: "#f1f5f9", minHeight: "100vh", padding: 20 }}>
      <style>{`
        .layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }

        .summary {
          background: #0f172a;
          color: white;
          padding: 20px;
          border-radius: 16px;
        }

        .card {
          background: white;
          padding: 20px;
          border-radius: 16px;
        }

        .buttonGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .presetBtn {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          background: white;
          font-size: 14px;
        }

        .activePreset {
          background: #0f172a;
          color: white;
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px #38bdf8;
          font-weight: 700;
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

          .summary {
            order: -1;
          }

          .buttonGrid {
            display: grid;
            grid-template-columns: 1fr 1fr;
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

      <h1>Hue Pricing Tool (Test Version)</h1>
      <p>Live quote calculator for coro, banners, ACM, and vinyl.</p>

      <div className="layout">
        <section className="card">
          <h2>Quick Presets</h2>

          <h3>Coro Yard Signs</h3>
          <div className="buttonGrid">
            <button className={presetClass("coro", 24, 18, false)} onClick={() => preset("coro", 24, 18, false)}>18x24 Single</button>
            <button className={presetClass("coro", 24, 18, true)} onClick={() => preset("coro", 24, 18, true)}>18x24 Double</button>
            <button className={presetClass("coro", 18, 12, false)} onClick={() => preset("coro", 18, 12, false)}>12x18 Single</button>
            <button className={presetClass("coro", 18, 12, true)} onClick={() => preset("coro", 18, 12, true)}>12x18 Double</button>
          </div>

          <h3>Banners</h3>
          <div className="buttonGrid">
            <button className={presetClass("banner", 36, 24)} onClick={() => preset("banner", 36, 24)}>24x36</button>
            <button className={presetClass("banner", 60, 36)} onClick={() => preset("banner", 60, 36)}>36x60</button>
            <button className={presetClass("banner", 72, 36)} onClick={() => preset("banner", 72, 36)}>36x72</button>
            <button className={presetClass("banner", 96, 36)} onClick={() => preset("banner", 96, 36)}>36x96</button>
            <button className={presetClass("banner", 96, 48)} onClick={() => preset("banner", 96, 48)}>48x96</button>
          </div>

          <h3>ACM / Maxmetal</h3>
          <div className="buttonGrid">
            <button className={presetClass("acm", 24, 18)} onClick={() => preset("acm", 24, 18)}>18x24</button>
            <button className={presetClass("acm", 24, 36)} onClick={() => preset("acm", 24, 36)}>24x36</button>
            <button className={presetClass("acm", 24, 48)} onClick={() => preset("acm", 24, 48)}>24x48</button>
            <button className={presetClass("acm", 32, 48)} onClick={() => preset("acm", 32, 48)}>32x48</button>
            <button className={presetClass("acm", 36, 48)} onClick={() => preset("acm", 36, 48)}>36x48</button>
            <button className={presetClass("acm", 48, 48)} onClick={() => preset("acm", 48, 48)}>48x48</button>
            <button className={presetClass("acm", 24, 96)} onClick={() => preset("acm", 24, 96)}>24x96</button>
            <button className={presetClass("acm", 48, 96)} onClick={() => preset("acm", 48, 96)}>48x96</button>
          </div>

          <h3>Printed Vinyl</h3>
          <div className="buttonGrid">
            <button className={presetClass("vinyl", 12, 12)} onClick={() => preset("vinyl", 12, 12)}>12x12</button>
            <button className={presetClass("vinyl", 24, 12)} onClick={() => preset("vinyl", 24, 12)}>12x24</button>
            <button className={presetClass("vinyl", 24, 24)} onClick={() => preset("vinyl", 24, 24)}>24x24</button>
            <button className={presetClass("vinyl", 36, 24)} onClick={() => preset("vinyl", 36, 24)}>24x36</button>
            <button className={presetClass("vinyl", 48, 24)} onClick={() => preset("vinyl", 48, 24)}>24x48</button>
            <button className={presetClass("vinyl", 96, 48)} onClick={() => preset("vinyl", 96, 48)}>48x96</button>
          </div>

          <h2>Quote Details</h2>

          <label>Product</label>
          <select style={input} value={product} onChange={(e) => setProduct(e.target.value)}>
            {Object.entries(products).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>

          {product === "vinyl" && (
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

          {product === "coro" && (
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

          {product === "banner" && (
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

          {product === "acm" && (
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

          <div className="formGrid" style={grid}>
            <Field label="Quantity" value={qty} setValue={setQty} />
            <Field label="Width Inches" value={width} setValue={setWidth} />
            <Field label="Height Inches" value={height} setValue={setHeight} />
            <Field label="Margin %" value={margin} setValue={setMargin} />
            <Field label="Delivery / Install" value={delivery} setValue={setDelivery} />
            <Field label="Price Multiplier" value={multiplier} setValue={setMultiplier} />
          </div>

          <Box title="Optional Fees">
            <Check label="Add Design Fee" value={useDesignFee} setValue={setUseDesignFee} />
            {useDesignFee && <Field label="Design Fee" value={designFee} setValue={setDesignFee} />}
            <Check label="Add Setup Fee" value={useSetupFee} setValue={setUseSetupFee} />
            {useSetupFee && <Field label="Setup Fee" value={setupFee} setValue={setSetupFee} />}
          </Box>
        </section>

        <aside className="summary">
          <h2>Suggested Retail</h2>
          <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(calc.retail)}</div>
          <p>Each: <strong>{money(calc.each)}</strong></p>
          <p>Profit: <strong>{money(calc.profit)}</strong></p>
          <hr />
          <p>Product: {calc.label}</p>
          <p>Total Sq Ft: {calc.totalSqFt?.toFixed(2)}</p>

          {calc.actualTotalSqFt !== undefined && <p>Actual Sq Ft: {calc.actualTotalSqFt.toFixed(2)}</p>}
          {calc.effectiveSqFtEach !== undefined && <p>Effective Sq Ft Each: {calc.effectiveSqFtEach.toFixed(2)}</p>}
          {calc.billableSqFtEach !== undefined && <p>Billable Sq Ft Each: {calc.billableSqFtEach.toFixed(2)}</p>}
          {calc.layoutWidth !== undefined && calc.layoutHeight !== undefined && (
            <p>Layout Size: {calc.layoutWidth}" x {calc.layoutHeight}"</p>
          )}
          {calc.rawBillableSqFt !== undefined && <p>Raw Gang Sq Ft: {calc.rawBillableSqFt.toFixed(2)}</p>}
          {calc.billingMode !== undefined && <p>Billing Mode: {calc.billingMode}</p>}
          {calc.normalSqFt !== undefined && <p>Normal Layout Sq Ft: {calc.normalSqFt.toFixed(2)}</p>}
          {calc.rotatedSqFt !== undefined && <p>Rotated Layout Sq Ft: {calc.rotatedSqFt.toFixed(2)}</p>}

          {calc.tierPrice !== undefined && <p>Tier Price Total: {money(calc.tierPrice)}</p>}
          {calc.costMarginPrice !== undefined && <p>Cost + Margin Price: {money(calc.costMarginPrice)}</p>}
          {calc.shopPrice !== undefined && <p>Shop Sq Ft Price: {money(calc.shopPrice)}</p>}
          {calc.sheetsUsed !== undefined && <p>Sheets Used: {calc.sheetsUsed.toFixed(2)}</p>}
          {calc.sheetsRounded !== undefined && <p>Sheets Rounded: {calc.sheetsRounded}</p>}
          {calc.piecesPerSheet !== undefined && <p>Pieces Per Sheet: {calc.piecesPerSheet}</p>}
          {calc.sheetLayout !== undefined && <p>Sheet Layout: {calc.sheetLayout}</p>}
          <p>Material Cost: {money(calc.materialCost)}</p>
          <p>Shipping: {money(calc.shipping)}</p>
          <p>Direct Cost: {money(calc.cost)}</p>
          <p>Actual Margin: {calc.margin.toFixed(1)}%</p>
          <p>Multiplier: {num(multiplier, 1)}x</p>

          <ProductVisual product={product} />
          {product === "vinyl" && <VinylLayoutPreview calc={calc} />}
          <SelectedDetails details={selectedDetails} />
        </aside>
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
    <div style={{ marginTop: 20, padding: 15, background: "#f8fafc", borderRadius: 12 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function ProductVisual({ product }) {
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

  return (
    <div style={visualBox}>
      <div style={acmVisual}>ACM</div>
      <p style={visualLabel}>ACM / Maxmetal Selected</p>
    </div>
  );
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