"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  displayTradeshowCatalog,
  displayTradeshowParserMeta,
  displayTradeshowTagList,
} from "../../data/displayTradeshowConfig";

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" };

const getTierForQuantity = (tiers, quantity) => tiers.find((tier) => quantity >= (tier.min ?? 0) && (tier.max === null || tier.max === undefined || quantity <= tier.max)) || null;
const tierLabel = (tier) => (tier ? `${tier.min ?? "?"}${tier.max === null || tier.max === undefined ? "+" : `-${tier.max}`}` : "N/A");

export default function DisplayTradeshowProductsPage() {
  const [mode, setMode] = useState("customer-online");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(displayTradeshowCatalog[0]?.id || "");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedSided, setSelectedSided] = useState("");
  const [selectedHardware, setSelectedHardware] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [quoteItems, setQuoteItems] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedMode = localStorage.getItem("hue-staff-mode");
    if (savedMode) setMode(savedMode);
  }, []);

  const isAdminView = mode === "admin";

  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return displayTradeshowCatalog.filter((p) => {
      const tagOk = activeTag === "All" || (p.tags || []).includes(activeTag);
      const text = `${p.name || ""} ${p.subcategory || ""} ${p.description || ""}`.toLowerCase();
      return tagOk && (!needle || text.includes(needle));
    });
  }, [activeTag, search]);

  const selectedProduct = useMemo(() => displayTradeshowCatalog.find((p) => p.id === selectedProductId) || filteredProducts[0] || null, [filteredProducts, selectedProductId]);
  const selectedSize = selectedProduct?.sizes?.find((s) => s.id === selectedSizeId) || selectedProduct?.sizes?.[0] || null;
  const activeTiers = selectedSize?.tierPricingBySide?.[selectedSided] || selectedSize?.tierPricing || [];

  useEffect(() => {
    if (!selectedProduct) return;
    setSelectedSizeId(selectedProduct.sizes?.[0]?.id || "");
    setSelectedSided(selectedProduct.sidedOptions?.[0] || "N/A");
    setSelectedHardware(selectedProduct.hardwareOptions?.[0] || "N/A");
    setQuantity(selectedProduct.moq || 1);
  }, [selectedProductId]);

  const activeTier = useMemo(() => (selectedSize ? getTierForQuantity(activeTiers, quantity) : null), [activeTiers, quantity, selectedSize]);
  const isCallForPricing = !activeTier || activeTier.retailEach === "CALL";
  const retailEach = isCallForPricing ? null : Number(activeTier.retailEach);
  const retailTotal = retailEach == null ? null : retailEach * Number(quantity || 0);

  const missingFields = selectedProduct?.missingFields || [];

  if (!isAdminView) return <main style={{ padding: 20 }}><Link href="/">← Back to main pricing app</Link><h1>Display / Tradeshow Products</h1><p><strong>Coming Soon</strong></p></main>;

  return <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}><div style={{ maxWidth: 1150, margin: "0 auto" }}><Link href="/">← Back to main pricing app</Link><h1>Display / Tradeshow Products</h1>
    <p>Admin-only parsed catalog workflow.</p>
    <div style={{ marginBottom: 10, fontSize: 12, color: "#475569" }}>Parser meta: source={displayTradeshowParserMeta.sourceDir}, generatedAt={displayTradeshowParserMeta.generatedAt || "N/A"}, version={displayTradeshowParserMeta.parserVersion}</div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
        <input style={inputStyle} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search parsed products" />
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>{["All", ...displayTradeshowTagList].map((tag)=><button key={tag} onClick={()=>setActiveTag(tag)}>{tag}</button>)}</div>
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>{filteredProducts.map((p)=><button key={p.id} onClick={()=>setSelectedProductId(p.id)} style={{textAlign:"left"}}>{p.name || p.id} <small>({p.status})</small></button>)}</div>
      </section>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
        {!selectedProduct ? <div>No parsed products.</div> : <>
          <h3>{selectedProduct.name || "Unnamed Product"}</h3>
          <p>{selectedProduct.description || ""}</p>
          <p><strong>Reference:</strong> {selectedProduct.imageReference || ""}</p>
          <p><strong>Status:</strong> {selectedProduct.status || "needs_review"}</p>
          <p><strong>OCR Confidence:</strong> {typeof selectedProduct.ocrConfidence === "number" ? selectedProduct.ocrConfidence.toFixed(2) : "N/A"}</p>
          <p><strong>Missing fields:</strong> {missingFields.length ? missingFields.join(", ") : "None"}</p>
          <label>Size / Option<select style={inputStyle} value={selectedSizeId} onChange={(e)=>setSelectedSizeId(e.target.value)}>{(selectedProduct.sizes||[]).length ? selectedProduct.sizes.map((s)=><option key={s.id} value={s.id}>{s.label}</option>) : <option>Needs review</option>}</select></label>
          <label>Quantity<input style={inputStyle} type="number" min={selectedProduct.moq || 1} value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} /></label>
          <label>Print Side<select style={inputStyle} value={selectedSided} onChange={(e)=>setSelectedSided(e.target.value)}>{(selectedProduct.sidedOptions||["N/A"]).map((s)=><option key={s}>{s}</option>)}</select></label>
          <label>Hardware<select style={inputStyle} value={selectedHardware} onChange={(e)=>setSelectedHardware(e.target.value)}>{(selectedProduct.hardwareOptions||["N/A"]).map((h)=><option key={h}>{h}</option>)}</select></label>
          <div><strong>Tier used:</strong> {tierLabel(activeTier)}</div>
          <div><strong>Retail each:</strong> {retailEach == null ? "Call for pricing" : `$${retailEach.toFixed(2)}`}</div>
          <div><strong>Retail total:</strong> {retailTotal == null ? "Call for pricing" : `$${retailTotal.toFixed(2)}`}</div>
        </>}
      </section>
    </div>

    <section style={{ marginTop: 14, border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
      <h3>Parser Debug</h3>
      <ul>
        {displayTradeshowCatalog.map((p)=><li key={p.id}><strong>{p.name || p.id}</strong> — file: {p.parsedFromFile || "N/A"}, confidence: {typeof p.ocrConfidence === "number" ? p.ocrConfidence.toFixed(2) : "N/A"}, status: {p.status || "needs_review"}, missing: {(p.missingFields||[]).join(", ") || "None"}</li>)}
      </ul>
    </section>
  </div></main>;
}
