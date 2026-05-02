"use client";

import { useMemo, useState } from "react";

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

const num = (v, fallback = 0) => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

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

  const calc = useMemo(() => {
    const q = Math.max(num(qty, 1), 1);
    const cost = 4 * q;
    const retail = (cost / (1 - margin / 100)) * multiplier;

    return {
      retail,
      each: retail / q,
      cost,
      profit: retail - cost,
      margin: ((retail - cost) / retail) * 100,
    };
  }, [qty, margin, multiplier]);

  return (
    <main style={{ fontFamily: "Arial", background: "#f1f5f9", minHeight: "100vh", padding: 20 }}>

      {/* ✅ MOBILE + DESKTOP STYLING */}
      <style>{`
        .layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }

        @media (max-width: 800px) {
          .layout {
            display: flex;
            flex-direction: column;
          }

          .summary {
            order: -1;
          }

          button {
            width: 100%;
          }
        }

        button {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #ccc;
          background: #fff;
        }
      `}</style>

      <h1>Hue Graphics Pricing App</h1>
      <p>Live quote calculator for coro, banners, and ACM.</p>

      <div className="layout">

        {/* LEFT SIDE */}
        <section style={{ background: "white", padding: 20, borderRadius: 16 }}>

          <h2>Quick Presets</h2>

          <h3>Coro Yard Signs</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setProduct("coro"); setWidth(24); setHeight(18); }}>18x24 Single</button>
            <button onClick={() => { setProduct("coro"); setWidth(24); setHeight(18); }}>18x24 Double</button>
            <button onClick={() => { setProduct("coro"); setWidth(18); setHeight(12); }}>12x18 Single</button>
            <button onClick={() => { setProduct("coro"); setWidth(18); setHeight(12); }}>12x18 Double</button>
          </div>

          <h3>Banners</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setProduct("banner"); setWidth(36); setHeight(24); }}>24x36</button>
            <button onClick={() => { setProduct("banner"); setWidth(60); setHeight(36); }}>36x60</button>
          </div>

          <h2>Quote Details</h2>

          <label>Quantity</label>
          <input value={qty} onChange={(e) => setQty(e.target.value)} style={input} />

          <label>Width</label>
          <input value={width} onChange={(e) => setWidth(e.target.value)} style={input} />

          <label>Height</label>
          <input value={height} onChange={(e) => setHeight(e.target.value)} style={input} />

          <label>Margin %</label>
          <input value={margin} onChange={(e) => setMargin(e.target.value)} style={input} />

          <label>Multiplier</label>
          <input value={multiplier} onChange={(e) => setMultiplier(e.target.value)} style={input} />

        </section>

        {/* RIGHT SIDE */}
        <aside className="summary" style={{ background: "#0f172a", color: "white", padding: 20, borderRadius: 16 }}>

          <h2>Suggested Retail</h2>
          <div style={{ fontSize: 40, fontWeight: "bold" }}>{money(calc.retail)}</div>

          <p>Each: {money(calc.each)}</p>
          <p>Profit: {money(calc.profit)}</p>
          <p>Cost: {money(calc.cost)}</p>
          <p>Margin: {calc.margin.toFixed(1)}%</p>

          {/* VISUAL */}
          <div style={{ marginTop: 20, padding: 15, background: "#1e293b", borderRadius: 12, textAlign: "center" }}>
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              fontWeight: "bold"
            }}>
              {product.toUpperCase()}
            </div>
          </div>

        </aside>

      </div>
    </main>
  );
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ccc"
};
