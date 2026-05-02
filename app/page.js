"use client";

import { useMemo, useState } from "react";

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const num = (v, fallback = 0) => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

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
  let price = coroPricing[type][0].price;
  for (let t of coroPricing[type]) {
    if (qty >= t.min) price = t.price;
  }
  return price;
}

function getCoroSheetCost(qty, type) {
  if (qty <= 9) return coroSheetCost[type][0];
  if (qty <= 50) return coroSheetCost[type][1];
  return coroSheetCost[type][2];
}

function shippingBySize(w, h, sheets) {
  const max = Math.max(w, h);
  const min = Math.min(w, h);

  if (max <= 36 && min <= 24) return sheets >= 58 ? 199 : 10;
  if (max <= 48 && min <= 32) return sheets >= 22 ? 199 : 15;
  if (max <= 48 && min <= 36) return sheets >= 22 ? 199 : 35;
  if (max <= 48 && min <= 48) return sheets >= 10 ? 199 : sheets >= 6 ? 75 : 50;
  if ((max <= 72 && min <= 39) || (max <= 96 && min <= 24)) return sheets >= 10 ? 199 : 75;
  return 199;
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
  const [bannerType, setBannerType] = useState("13-single");
  const [acmType, setAcmType] = useState("3-single");
  const [acmSqFtPrice, setAcmSqFtPrice] = useState(18);

  function preset(prod, w, h, double = false) {
    setProduct(prod);
    setWidth(w);
    setHeight(h);
    if (prod === "coro") setCoroDouble(double);
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

    if (product === "banner") {
      const b = bannerOptions[bannerType];
      const materialCost = totalSqFt * b.cost;
      const basePrice = totalSqFt * b.retail;
      const retail = (basePrice + fees) * mult;

      return {
        label: "Banner",
        retail,
        each: retail / q,
        cost: materialCost,
        profit: retail - materialCost,
        margin: retail ? ((retail - materialCost) / retail) * 100 : 0,
        totalSqFt,
        materialCost,
        shipping: 0,
        basePrice,
      };
    }

    if (product === "acm") {
      const a = acmOptions[acmType];
      const costEach = Math.max(sqInEach * a.costPerSqIn, a.minCost);
      const materialCost = costEach * q;
      const sheetsUsed = (sqInEach * q) / 4608;
      const sheetsRounded = Math.ceil(sheetsUsed);
      const shipping = shippingBySize(w, h, sheetsRounded);
      const cost = materialCost + shipping;

      const costMarginPrice = cost / (1 - m);
      const shopPrice = totalSqFt * num(acmSqFtPrice, 18);
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
        costMarginPrice,
        shopPrice,
        basePrice,
      };
    }

    const type = coroDouble ? "double" : "single";
    const scale = w === 18 && h === 12 ? 0.5 : 1;
    const tierEach = getTierPrice(q, type) * scale;
    const tierPrice = tierEach * q;

    const sheetsUsed = (sqInEach * q) / 4608;
    const sheetsRounded = Math.ceil(sheetsUsed);
    const materialCost = getCoroSheetCost(q, type) * sheetsRounded;
    const shipping = shippingBySize(w, h, sheetsRounded);
    const cost = materialCost + shipping;

    const costMarginPrice = cost / (1 - m);
    const basePrice = Math.max(tierPrice, costMarginPrice);
    const retail = (basePrice + fees) * mult;

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
      sheetsUsed,
      sheetsRounded,
      tierPrice,
      costMarginPrice,
      basePrice,
    };
  }, [
    product, width, height, qty, margin, multiplier,
    useDesignFee, useSetupFee, designFee, setupFee, delivery,
    coroDouble, bannerType, acmType, acmSqFtPrice
  ]);

  return (
    <main style={{ fontFamily: "Arial", background: "#f1f5f9", minHeight: "100vh", padding: 20 }}>
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

          {product === "coro" && (
            <label style={{ display: "block", marginTop: 12 }}>
              <input type="checkbox" checked={coroDouble} onChange={(e) => setCoroDouble(e.target.checked)} /> Double Sided
            </label>
          )}

          {product === "banner" && (
            <>
              <label>Banner Material</label>
              <select style={input} value={bannerType} onChange={(e) => setBannerType(e.target.value)}>
                {Object.entries(bannerOptions).map(([key, b]) => (
                  <option key={key} value={key}>{b.name} — {money(b.retail)}/sq ft</option>
                ))}
              </select>
            </>
          )}

          {product === "acm" && (
            <>
              <label>ACM Type</label>
              <select style={input} value={acmType} onChange={(e) => setAcmType(e.target.value)}>
                {Object.entries(acmOptions).map(([key, a]) => (
                  <option key={key} value={key}>{a.name}</option>
                ))}
              </select>
              <Field label="Shop $ Per Sq Ft" value={acmSqFtPrice} setValue={setAcmSqFtPrice} />
            </>
          )}

          <div style={grid}>
            <Field label="Quantity" value={qty} setValue={setQty} />
            <Field label="Width Inches" value={width} setValue={setWidth} />
            <Field label="Height Inches" value={height} setValue={setHeight} />
            <Field label="Margin %" value={margin} setValue={setMargin} />
            <Field label="Delivery / Install" value={delivery} setValue={setDelivery} />
            <Field label="Price Multiplier" value={multiplier} setValue={setMultiplier} />
          </div>

          <div style={feeBox}>
            <h3>Optional Fees</h3>

            <label style={checkLine}>
              <input type="checkbox" checked={useDesignFee} onChange={(e) => setUseDesignFee(e.target.checked)} />
              Add Design Fee
            </label>
            {useDesignFee && <Field label="Design Fee" value={designFee} setValue={setDesignFee} />}

            <label style={checkLine}>
              <input type="checkbox" checked={useSetupFee} onChange={(e) => setUseSetupFee(e.target.checked)} />
              Add Setup Fee
            </label>
            {useSetupFee && <Field label="Setup Fee" value={setupFee} setValue={setSetupFee} />}
          </div>
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
          <p>Multiplier: {num(multiplier, 1)}x</p>

          <ProductVisual product={product} />
        </aside>
      </div>
    </main>
  );
}

const card = { background: "white", padding: 20, borderRadius: 16 };
const summary = { background: "#0f172a", color: "white", padding: 20, borderRadius: 16 };
const buttons = { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 };
const input = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ccc", fontSize: 16 };
const feeBox = { marginTop: 20, padding: 15, background: "#f8fafc", borderRadius: 12 };
const checkLine = { display: "block", marginTop: 12 };

function Field({ label, value, setValue }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0"
        style={input}
      />
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

  return (
    <div style={visualBox}>
      <div style={acmVisual}>ACM</div>
      <p style={visualLabel}>ACM / Maxmetal Selected</p>
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

const visualLabel = {
  marginTop: 12,
  fontSize: 14,
  color: "#cbd5e1",
};

const coroSign = {
  display: "inline-block",
  position: "relative",
  height: 120,
  width: 180,
};

const signPanel = {
  background: "white",
  color: "#0f172a",
  borderRadius: 8,
  padding: "28px 10px",
  fontSize: 30,
  fontWeight: "bold",
  border: "4px solid #38bdf8",
};

const stakeLeft = {
  position: "absolute",
  left: 55,
  top: 80,
  width: 5,
  height: 55,
  background: "#94a3b8",
};

const stakeRight = {
  position: "absolute",
  right: 55,
  top: 80,
  width: 5,
  height: 55,
  background: "#94a3b8",
};

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
