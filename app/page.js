"use client";

import { useMemo, useState } from "react";

const products = {
  coroplast: { name: "Coroplast Yard Sign", material: 1.15, print: 2.35, min: 18, labor: 8 },
  realEstate: { name: "Real Estate Sign Panel", material: 3.25, print: 3.75, min: 65, labor: 18 },
  rider: { name: "Real Estate Rider", material: 2.1, print: 2.95, min: 25, labor: 10 },
  banner: { name: "Vinyl Banner", material: 1.85, print: 3.65, min: 45, labor: 15 },
  meshBanner: { name: "Mesh Banner", material: 2.25, print: 4.1, min: 65, labor: 20 },
  aluminum: { name: "Aluminum Sign", material: 4.5, print: 3.95, min: 55, labor: 20 },
  acm: { name: "ACM / Dibond Sign", material: 5.85, print: 4.25, min: 85, labor: 25 },
  pvc: { name: "PVC Sign", material: 3.45, print: 3.45, min: 55, labor: 18 },
  foamBoard: { name: "Foam Board Sign", material: 2.4, print: 3.1, min: 40, labor: 14 },
  decal: { name: "Cut Vinyl / Decal", material: 1.5, print: 2.85, min: 25, labor: 12 },
  printedVinyl: { name: "Printed Vinyl Decal", material: 2.1, print: 4.25, min: 35, labor: 16 },
  windowPerf: { name: "Window Perf", material: 3.25, print: 4.75, min: 65, labor: 22 },
  magnet: { name: "Vehicle Magnet", material: 4.2, print: 3.85, min: 55, labor: 18 },
  bannerStand: { name: "Retractable Banner Stand", material: 5.25, print: 4.75, min: 145, labor: 25 },
};

const money = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function Page() {
  const [productKey, setProductKey] = useState("coroplast");
  const [width, setWidth] = useState(24);
  const [height, setHeight] = useState(18);
  const [quantity, setQuantity] = useState(10);
  const [doubleSided, setDoubleSided] = useState(false);
  const [margin, setMargin] = useState(60);
  const [shopRate, setShopRate] = useState(65);
  const [designFee, setDesignFee] = useState(25);
  const [setupFee, setSetupFee] = useState(10);
  const [hardware, setHardware] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [rush, setRush] = useState(0);

  const product = products[productKey];

  const calc = useMemo(() => {
    const qty = Math.max(Number(quantity) || 1, 1);
    const sqFtEach = ((Number(width) || 0) * (Number(height) || 0)) / 144;
    const totalSqFt = sqFtEach * qty * (doubleSided ? 2 : 1);
    const materialCost = totalSqFt * product.material;
    const printCost = totalSqFt * product.print;
    const laborCost = (product.labor / 60) * Number(shopRate || 0);
    const cost = materialCost + printCost + laborCost + Number(hardware || 0) + Number(delivery || 0);
    const retail = Math.max(
      cost / (1 - Number(margin || 0) / 100) + Number(designFee || 0) + Number(setupFee || 0) + Number(rush || 0),
      product.min * qty
    );
    return {
      sqFtEach,
      totalSqFt,
      materialCost,
      printCost,
      laborCost,
      cost,
      retail,
      each: retail / qty,
      profit: retail - cost,
      actualMargin: ((retail - cost) / retail) * 100,
    };
  }, [productKey, width, height, quantity, doubleSided, margin, shopRate, designFee, setupFee, hardware, delivery, rush]);

  const inputStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 16,
  };

  return (
    <main style={{ fontFamily: "Arial", background: "#f1f5f9", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1>Hue Graphics Sign Pricing App</h1>
        <p>Demo pricing mode — placeholder prices for testing.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}>
          <section style={{ background: "white", padding: 20, borderRadius: 16 }}>
            <h2>Quote Details</h2>

            <label>Sign Type</label>
            <select style={inputStyle} value={productKey} onChange={(e) => setProductKey(e.target.value)}>
              {Object.entries(products).map(([key, p]) => (
                <option key={key} value={key}>{p.name}</option>
              ))}
            </select>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 }}>
              <Field label="Quantity" value={quantity} setValue={setQuantity} />
              <Field label="Width Inches" value={width} setValue={setWidth} />
              <Field label="Height Inches" value={height} setValue={setHeight} />
              <Field label="Target Margin %" value={margin} setValue={setMargin} />
              <Field label="Design Fee" value={designFee} setValue={setDesignFee} />
              <Field label="Setup Fee" value={setupFee} setValue={setSetupFee} />
              <Field label="Hardware / Stakes" value={hardware} setValue={setHardware} />
              <Field label="Delivery / Install" value={delivery} setValue={setDelivery} />
              <Field label="Rush Fee" value={rush} setValue={setRush} />
              <Field label="Shop Rate / Hour" value={shopRate} setValue={setShopRate} />
            </div>

            <label style={{ display: "block", marginTop: 15 }}>
              <input
                type="checkbox"
                checked={doubleSided}
                onChange={(e) => setDoubleSided(e.target.checked)}
              />{" "}
              Double-sided
            </label>
          </section>

          <aside style={{ background: "#0f172a", color: "white", padding: 20, borderRadius: 16 }}>
            <h2>Suggested Retail</h2>
            <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(calc.retail)}</div>
            <p>Price Each: <strong>{money(calc.each)}</strong></p>
            <p>Profit: <strong>{money(calc.profit)}</strong></p>
            <hr />
            <p>Total Sq Ft: {calc.totalSqFt.toFixed(2)}</p>
            <p>Material Cost: {money(calc.materialCost)}</p>
            <p>Print Cost: {money(calc.printCost)}</p>
            <p>Labor Cost: {money(calc.laborCost)}</p>
            <p>Direct Cost: {money(calc.cost)}</p>
            <p>Actual Margin: {calc.actualMargin.toFixed(1)}%</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, setValue }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
          fontSize: 16,
        }}
      />
    </div>
  );
}
