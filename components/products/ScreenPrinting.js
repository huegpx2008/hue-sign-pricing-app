"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Check, input } from "../FormControls";

const DATA_PATH = "/data/SanMar_SDL_hue.csv";
const QUICK_STYLES = ["2000", "2400", "BC3001", "996M", "1717", "ST350", "ST350LS"];
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
const QTY_TIERS = [24, 50, 100, 150, 200, 250, 300];
const SINGLE_SIDE = {24:{1:6.5,2:7,3:7.5,4:8},50:{1:5.85,2:6.3,3:6.75,4:7.2},100:{1:5.53,2:5.95,3:6.38,4:6.8},150:{1:5.2,2:5.6,3:6,4:6.4},200:{1:4.88,2:5.25,3:5.63,4:6},250:{1:4.55,2:4.9,3:5.25,4:5.6},300:{1:4.23,2:4.55,3:4.88,4:5.2}};
const ADD_SIDE = {24:{1:2,2:2.5,3:3,4:3.5},50:{1:1.8,2:2.25,3:2.7,4:3.15},100:{1:1.7,2:2.13,3:2.55,4:2.98},150:{1:1.6,2:2,3:2.4,4:2.8},200:{1:1.5,2:1.88,3:2.25,4:2.63},250:{1:1.4,2:1.75,3:2.1,4:2.45},300:{1:1.3,2:1.63,3:1.95,4:2.28}};

const parseN = (v) => Number.parseFloat(String(v ?? "").replace(/[^0-9.-]/g, "")) || 0;
const getTier = (qty) => QTY_TIERS.reduce((a, t) => (qty >= t ? t : a), QTY_TIERS[0]);
const emptySizeQty = () => Object.fromEntries(SIZES.map((s) => [s, "0"]));
const makeLineItem = (id) => ({ id, search: "", style: "", color: "", sizeQty: emptySizeQty() });

export default function ScreenPrinting({ margin = 60, multiplier = 1, onSummaryChange }) {
  const [rows, setRows] = useState([]);
  const [lineItems, setLineItems] = useState([makeLineItem(1)]);
  const [locations, setLocations] = useState([{ id: 1, name: "Front", colors: 1 }]);
  const [setupFeeEnabled, setSetupFeeEnabled] = useState(false);

  useEffect(() => {
    fetch(DATA_PATH).then((r) => r.text()).then((txt) => {
      const [header, ...lines] = txt.split(/\r?\n/).filter(Boolean);
      const h = header.split(",");
      const idx = Object.fromEntries(h.map((k, i) => [k.trim(), i]));
      setRows(lines.map((line) => {
        const c = line.split(",");
        return { title: c[idx.PRODUCT_TITLE], style: c[idx["STYLE#"]], color: c[idx.COLOR_NAME], size: c[idx.SIZE], casePrice: parseN(c[idx.CASE_PRICE]) };
      }));
    }).catch(() => setRows([]));
  }, []);

  const byStyle = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (!map.has(r.style)) map.set(r.style, { title: r.title, colors: new Set() });
      map.get(r.style).colors.add(r.color);
    });
    return map;
  }, [rows]);

  const summary = useMemo(() => {
    const m = Math.min(parseN(margin), 95) / 100;
    const mult = parseN(multiplier) || 1;
    const itemDetails = lineItems.map((li) => {
      const totalQty = Object.values(li.sizeQty).reduce((s, q) => s + parseN(q), 0);
      const matched = rows.filter((r) => r.style === li.style && r.color === li.color);
      const garmentCost = SIZES.reduce((sum, sz) => {
        const q = parseN(li.sizeQty[sz]);
        const row = matched.find((r) => String(r.size).trim().toUpperCase() === sz);
        return sum + ((row?.casePrice || 0) * q);
      }, 0);
      const garmentRetail = m < 1 ? garmentCost / (1 - m) : 0;
      return { ...li, totalQty, garmentCost, garmentRetail, title: byStyle.get(li.style)?.title || "" };
    });
    const totalGarments = itemDetails.reduce((s, x) => s + x.totalQty, 0);
    const apparelDirectCost = itemDetails.reduce((s, x) => s + x.garmentCost, 0);
    const apparelRetailSubtotal = itemDetails.reduce((s, x) => s + x.garmentRetail, 0) * mult;
    const tier = getTier(totalGarments);
    const printChargeSubtotal = locations.reduce((sum, loc, idx) => sum + ((idx === 0 ? SINGLE_SIDE : ADD_SIDE)[tier]?.[loc.colors] || 0) * totalGarments, 0);
    const setupFee = setupFeeEnabled ? 25 : 0;
    const retail = apparelRetailSubtotal + printChargeSubtotal + setupFee;
    const each = totalGarments ? retail / totalGarments : 0;
    const cost = apparelDirectCost;
    return { retail, each, cost, profit: retail - cost, margin: retail ? ((retail - cost) / retail) * 100 : 0, materialCost: apparelDirectCost, shipping: 0, lineItems: itemDetails, totalGarments, apparelDirectCost, apparelRetailSubtotal, printChargeSubtotal, setupFee };
  }, [lineItems, rows, margin, multiplier, locations, setupFeeEnabled, byStyle]);

  useEffect(() => { onSummaryChange?.(summary); }, [summary, onSummaryChange]);

  const updateLineItem = (id, updater) => setLineItems((p) => p.map((x) => (x.id === id ? updater(x) : x)));
  const applyQuickStyle = (id, style) => {
    const colors = [...(byStyle.get(style)?.colors || [])];
    const black = colors.find((c) => String(c).toLowerCase() === "black");
    const next = emptySizeQty();
    next.L = "24";
    updateLineItem(id, (x) => ({ ...x, style, search: style, color: black || colors[0] || "", sizeQty: next }));
  };

  return <Box title="Screen Printing (Beta)">
    {lineItems.map((li) => {
      const styleOptions = [...byStyle.entries()].filter(([style, info]) => `${style} ${info.title}`.toLowerCase().includes(li.search.toLowerCase())).slice(0, 40);
      const colors = [...(byStyle.get(li.style)?.colors || [])];
      const itemSummary = summary.lineItems.find((x) => x.id === li.id);
      return <div key={li.id} style={{ border: "1px solid #334155", padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <div className="buttonGrid" style={{ marginBottom: 8 }}>{QUICK_STYLES.map((s) => <button key={`${li.id}-${s}`} className={`presetBtn ${li.style === s ? "activePreset" : ""}`} onClick={() => applyQuickStyle(li.id, s)}>{s}</button>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,2fr) minmax(240px,1fr)", gap: 12 }}>
          <div>
            <input style={input} placeholder="Search style # or title" value={li.search} onChange={(e) => updateLineItem(li.id, (x) => ({ ...x, search: e.target.value }))} />
            <select style={input} value={li.style} onChange={(e) => updateLineItem(li.id, (x) => ({ ...x, style: e.target.value, color: "" }))}><option value="">Select style</option>{styleOptions.map(([s, info]) => <option key={s} value={s}>{s} — {info.title}</option>)}</select>
            <p style={{ margin: "6px 0" }}><strong>Selected:</strong> {li.style ? `${li.style} — ${byStyle.get(li.style)?.title || ""}` : "None"}</p>
            <select style={input} value={li.color} onChange={(e) => updateLineItem(li.id, (x) => ({ ...x, color: e.target.value }))}><option value="">Select color</option>{colors.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(44px,1fr))", gap: 6 }}>
              {SIZES.map((s) => <label key={`${li.id}-${s}`} style={{ fontSize: 12 }}>{s}<input style={{ ...input, marginTop: 4, width: "100%", padding: "6px 8px" }} inputMode="numeric" value={li.sizeQty[s]} onChange={(e) => updateLineItem(li.id, (x) => ({ ...x, sizeQty: { ...x.sizeQty, [s]: e.target.value.replace(/[^0-9]/g, "") } }))} onBlur={() => updateLineItem(li.id, (x) => ({ ...x, sizeQty: { ...x.sizeQty, [s]: x.sizeQty[s] === "" ? "0" : String(parseN(x.sizeQty[s])) } }))} /></label>)}
            </div>
          </div>
        </div>
        <p style={{ marginBottom: 0 }}>Total Qty: {itemSummary?.totalQty || 0} • Garment Direct Cost: ${(itemSummary?.garmentCost || 0).toFixed(2)} • Garment Retail Subtotal: ${(itemSummary?.garmentRetail || 0).toFixed(2)}</p>
        {lineItems.length > 1 && <button className="modeBtn" style={{ marginTop: 8 }} onClick={() => setLineItems((p) => p.filter((x) => x.id !== li.id))}>Remove line item</button>}
      </div>;
    })}
    <button className="modeBtn" onClick={() => setLineItems((p) => [...p, makeLineItem(Date.now())])}>+ Add apparel line item</button>
    <hr />
    <h4>Imprint Locations</h4>
    {locations.map((loc, idx) => <div key={loc.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "end" }}>
      <div><label>Location</label><select style={input} value={loc.name} onChange={(e) => setLocations((p) => p.map((x) => x.id === loc.id ? { ...x, name: e.target.value } : x))}><option>Front</option><option>Back</option><option>Left Sleeve</option><option>Right Sleeve</option></select></div>
      <div><label>Ink Colors</label><select style={input} value={loc.colors} onChange={(e) => setLocations((p) => p.map((x) => x.id === loc.id ? { ...x, colors: parseN(e.target.value) } : x))}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></div>
      {locations.length > 1 ? <button className="modeBtn" onClick={() => setLocations((p) => p.filter((x) => x.id !== loc.id))}>Remove</button> : <div />}
      <div style={{ gridColumn: "1 / -1", fontSize: 12, opacity: 0.8 }}>{idx === 0 ? "First location uses single-sided matrix" : "Additional location uses additional-side matrix"}</div>
    </div>)}
    <button className="modeBtn" onClick={() => setLocations((p) => [...p, { id: Date.now(), name: "Back", colors: 1 }])}>+ Add print location</button>
    <Check label="Artwork/Setup Fee (+$25)" value={setupFeeEnabled} setValue={setSetupFeeEnabled} />
  </Box>;
}
