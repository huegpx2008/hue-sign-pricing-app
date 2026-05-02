"use client";

import { useMemo, useState } from "react";

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const products = {
  coro: "Coroplast Yard Signs",
  banner: "Vinyl Banners",
  acm: "ACM / Maxmetal",
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
  const tiers = coroPricing[type];
  let price = tiers[0].price;
  for (let t of tiers) if (qty >= t.min) price = t.price;
  return price;
}

function getCoroSheetCost(qty, type) {
  if (qty <= 9) return coroSheetCost[type][0];
  if (qty <= 50) return coroSheetCost[type][1];
  return coroSheetCost[type][2];
}

function shippingBySize(w, h, sheets, type = "default") {
  const max = Math.max(w, h);
  const min = Math.min(w, h);

  if (max <= 36 && min <= 24) return sheets >= (type === "coro" ? 58 : 10) ? 199 : 10;
  if (max <= 48 && min <= 32) return sheets >= 22 ? 199 : 15;
  if (max <= 48 && min <= 36) return sheets >= 22 ? 199 : 35;
  if (max <= 48 && min <= 48) return sheets >= 10 ? 199 : sheets >= 6 ? 75 : 50;
  if ((max <= 72 && min <= 39) || (max <= 96 && min <= 24)) return sheets >= 10 ? 199 : 75;
  if (max <= 96 && min <= 48) return 199;
  return 199;
}

export default function Page() {
  const [product, setProduct] = useState("coro");
  const [width, setWidth] = useState(24);
  const [height, setHeight] = useState(18);
  const [qty, setQty] = useState(10);
  const [margin, setMargin] = useState(60);
  const [multiplier, setMultiplier] = useState(1);
  const [designFee, setDesignFee] = useState(25);
  const [setupFee, setSetupFee] = useState(10);
  const [delivery, setDelivery] = useState(0);

  const [coroDouble, setCoroDouble] = useState(false);
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

  function preset(prod, w, h, double = false) {
    setProduct(prod);
    setWidth(w);
    setHeight(h);
    if (prod === "coro") setCoroDouble(double);
  }

  const calc = useMemo(() => {
    const q = Math.max(Number(qty) || 1, 1);
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    const sqInEach = w * h;
    const sqFtEach = sqInEach / 144;
    const totalSqFt = sqFtEach * q;
    const mult = Number(multiplier) || 1;
    const marginDecimal = Number(margin || 60) / 100;

    if (product === "coro") {
      const type = coroDouble ? "double" : "single";
      const scale = w === 18 && h === 12 ? 0.5 : 1;
      const tierEach = getTierPrice(q, type) * scale;

      let tierRetail = tierEach * q;
      if (stakes) tierRetail += q * 1.25;
      if (heavyStakes) tierRetail += q * 2.25;
      if (grommets) tierRetail += q * 0.25 + 15;
      if (gloss) tierRetail += q * 4;
      if (coroContour) tierRetail *= 1.1;
      if (coroRush) tierRetail *= 2;

      const sheetsUsed = (sqInEach * q) / 4608;
      const sheetsRounded = Math.ceil(sheetsUsed);
      const materialCost = getCoroSheetCost(q, type) * sheetsRounded;
      const shipping = shippingBySize(w, h, sheetsRounded, "coro");
      const cost = materialCost + shipping;
      const costMarginPrice = cost / (1 - marginDecimal);

      const retail = (Math.max(tierRetail, costMarginPrice) + designFee + setupFee + delivery) * mult;

      return {
        label: "Coroplast",
        retail,
        each: retail / q,
        cost,
        profit: retail - cost,
        margin: retail > 0 ? ((retail - cost) / retail) * 100 : 0,
        tierPrice: tierRetail,
        costMarginPrice,
        materialCost,
        shipping,
        sheetsUsed,
        sheetsRounded,
        totalSqFt,
      };
    }

    if (product === "banner") {
      const selected = bannerOptions[bannerType];
      const perimeterFt = ((w * 2 + h * 2) / 12);

      const cost = totalSqFt * selected.cost;
      let retail = totalSqFt * selected.retail;

      if (polePocket) retail += perimeterFt * q + 10;
      if (rope) retail += perimeterFt * q;
      if (windSlits) retail += totalSqFt * 0.5;

      retail += designFee + setupFee + delivery;
      if (bannerRush) retail *= 2;
      retail *= mult;

      return {
        label: "Banner",
        retail,
        each: retail / q,
        cost,
        profit: retail - cost,
        margin: retail > 0 ? ((retail - cost) / retail) * 100 : 0,
        materialCost: cost,
        shipping: 0,
        totalSqFt,
      };
    }

    if (product === "acm") {
      const selected = acmOptions[acmType];
      const rawEach = sqInEach * selected.costPerSqIn;
      const costEach = Math.max(rawEach, selected.minCost);
      const materialCost = costEach * q;

      const sheetsUsed = (sqInEach * q) / 4608;
      const sheetsRounded = Math.ceil(sheetsUsed);
      const shipping = shippingBySize(w, h, sheetsRounded, "acm");
      const cost = materialCost + shipping;

      let costMarginPrice = cost / (1 - marginDecimal);
      let shopPrice = totalSqFt * Number(acmSqFtPrice || 18);

      if (acmContour) {
        costMarginPrice *= 1.1;
        shopPrice *= 1.1;
      }

      if (roundedCorners) {
        costMarginPrice += 5;
        shopPrice += 5;
      }

      const retail = (Math.max(costMarginPrice, shopPrice) + designFee + setupFee + delivery) * mult;

      return {
        label: "ACM / Maxmetal",
        retail,
        each: retail / q,
        cost,
        profit: retail - cost,
        margin: retail > 0 ? ((retail - cost) / retail) * 100 : 0,
        costMarginPrice,
        shopPrice,
        materialCost,
        shipping,
        sheetsUsed,
        sheetsRounded,
        totalSqFt,
      };
    }
  }, [
    product, width, height, qty, margin, multiplier, designFee, setupFee, delivery,
    coroDouble, stakes, heavyStakes, grommets, gloss, coroContour, coroRush,
    bannerType, polePocket, rope, windSlits, bannerRush,
    acmType, acmSqFtPrice, acmContour, roundedCorners
  ]);

  return (
    <main style={{ fontFamily: "Arial", background: "#f1f5f9", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1>Hue Graphics Pricing App</h1>
        <p>Live quote calculator for coro, banners, and ACM.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          <section style={card}>
            <h2>Quick Presets</h2>

            <h3>Coro Yard Signs</h3>
            <div style={buttons}>
              <button onClick={() => preset("coro", 24, 18, false)}>18x24 Single</button>
              <button onClick={() => preset("coro", 24, 18, true)}>18x24 Double</button>
              <button onClick={() => preset("coro", 18, 12, false)}>12x18 Single</button>
              <button onClick={() => preset("coro", 18, 12, true)}>12x18 Double</button>
            </div>

            <h3>Banners</h3>
            <div style={buttons}>
              <button onClick={() => preset("banner", 36, 24)}>24x36</button>
              <button onClick={() => preset("banner", 60, 36)}>36x60</button>
              <button onClick={() => preset("banner", 72, 36)}>36x72</button>
              <button onClick={() => preset("banner", 96, 36)}>36x96</button>
              <button onClick={() => preset("banner", 96, 48)}>48x96</button>
            </div>

            <h3>ACM / Maxmetal</h3>
            <div style={buttons}>
              <button onClick={() => preset("acm", 24, 18)}>18x24</button>
              <button onClick={() => preset("acm", 24, 36)}>24x36</button>
              <button onClick={() => preset("acm", 24, 48)}>24x48</button>
              <button onClick={() => preset("acm", 32, 48)}>32x48</button>
              <button onClick={() => preset("acm", 36, 48)}>36x48</button>
              <button onClick={() => preset("acm", 48, 48)}>48x48</button>
              <button onClick={() => preset("acm", 24, 96)}>24x96</button>
              <button onClick={() => preset("acm", 48, 96)}>48x96</button>
            </div>

            <h2>Quote Details</h2>

            <label>Product</label>
            <select style={input} value={product} onChange={(e) => setProduct(e.target.value)}>
              {Object.entries(products).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>

            <div style={grid}>
              <Field label="Quantity" value={qty} setValue={setQty} />
              <Field label="Width Inches" value={width} setValue={setWidth} />
              <Field label="Height Inches" value={height} setValue={setHeight} />
              <Field label="Margin %" value={margin} setValue={setMargin} />
              <Field label="Design Fee" value={designFee} setValue={setDesignFee} />
              <Field label="Setup Fee" value={setupFee} setValue={setSetupFee} />
              <Field label="Delivery / Install" value={delivery} setValue={setDelivery} />
              <Field label="Price Multiplier" value={multiplier} setValue={setMultiplier} />
            </div>

            {product === "coro" && (
              <Box title="Coro Options">
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
          </section>

          <aside style={summary}>
            <h2>Suggested Retail</h2>
            <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(calc.retail)}</div>
            <p>Each: <strong>{money(calc.each)}</strong></p>
            <p>Profit: <strong>{money(calc.profit)}</strong></p>
            <hr />
            <p>Product: {calc.label}</p>
            <p>Total Sq Ft: {calc.totalSqFt?.toFixed(2)}</p>
            {calc.tierPrice !== undefined && <p>Tier Price Total: {money(calc.tierPrice)}</p>}
            {calc.costMarginPrice !== undefined && <p>Cost + Margin Price: {money(calc.costMarginPrice)}</p>}
            {calc.shopPrice !== undefined && <p>Shop Sq Ft Price: {money(calc.shopPrice)}</p>}
            {calc.sheetsUsed !== undefined && <p>Sheets Used: {calc.sheetsUsed.toFixed(2)}</p>}
            {calc.sheetsRounded !== undefined && <p>Sheets Rounded: {calc.sheetsRounded}</p>}
            <p>Material Cost: {money(calc.materialCost)}</p>
            <p>Shipping: {money(calc.shipping)}</p>
            <p>Direct Cost: {money(calc.cost)}</p>
            <p>Actual Margin: {calc.margin.toFixed(1)}%</p>
            <p>Multiplier: {multiplier}x</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

const card = { background: "white", padding: 20, borderRadius: 16 };
const summary = { background: "#0f172a", color: "white", padding: 20, borderRadius: 16 };
const buttons = { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 };
const input = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ccc", fontSize: 16 };

function Field({ label, value, setValue }) {
  return (
    <div>
      <label>{label}</label>
      <input type="number" value={value} onChange={(e) => setValue(e.target.value)} style={input} />
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
