"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { displayTradeshowCatalog, displayTradeshowTagList } from "../../data/displayTradeshowConfig";

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0" };
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
  const isNeedsReview = selectedProduct?.status === "NEEDS REVIEW";

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

  const addSelectedItem = () => {
    if (!selectedProduct || !selectedSize) return;
    setQuoteItems((prev) => [...prev, {
      id: `${selectedProduct.id}-${Date.now()}`,
      product: selectedProduct.name,
      size: selectedSize.label,
      printSide: selectedSided,
      hardware: selectedHardware,
      qty: quantity,
      retailEach: retailEach == null ? "Call for pricing" : `$${retailEach.toFixed(2)}`,
      retailTotal: retailTotal == null ? "Call for pricing" : `$${retailTotal.toFixed(2)}`,
    }]);
  };

  if (!isAdminView) return <main style={{ padding: 20 }}><Link href="/">← Back to main pricing app</Link><h1>Display / Tradeshow Products</h1><p><strong>Coming Soon</strong></p></main>;

  return <main style={{ minHeight: "100vh", padding: 20, fontFamily: 'Arial, Helvetica, "Segoe UI", Verdana, sans-serif', background: "linear-gradient(160deg,#0f172a,#111827 45%,#020617)", color: "#e2e8f0" }}>
    <div style={{ maxWidth: 1150, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}>← Back to main pricing app</Link>
      <h1>Display / Tradeshow Products</h1>
      <p style={{ color: "#cbd5e1" }}>Admin-only catalog.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <section style={{ border: "1px solid #334155", borderRadius: 12, padding: 12, background: "#111827" }}>
          <input style={inputStyle} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search products" />
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>{["All", ...displayTradeshowTagList].map((tag)=><button key={tag} onClick={()=>setActiveTag(tag)} style={{ borderRadius: 999, border: activeTag===tag?"2px solid #60a5fa":"1px solid #334155", padding: "6px 10px", background: activeTag===tag?"#1e3a8a":"#0b1220", color: "#e2e8f0" }}>{tag}</button>)}</div>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>{filteredProducts.map((p)=><button key={p.id} onClick={()=>setSelectedProductId(p.id)} style={{ textAlign:"left", borderRadius: 10, border: selectedProductId===p.id?"2px solid #60a5fa":"1px solid #334155", background: "#0b1220", color: "#e2e8f0", padding: "10px 12px" }}><div style={{fontWeight:700}}>{p.name}</div><div style={{fontSize:12,color:"#94a3b8"}}>{p.subcategory}</div></button>)}</div>
        </section>

        <section style={{ border: "1px solid #334155", borderRadius: 12, padding: 12, background: "#111827" }}>
          {!selectedProduct ? <div>No products available.</div> : <>
            <h3 style={{ marginTop: 0 }}>{selectedProduct.name}</h3>
            <div style={{ color: "#94a3b8", fontSize: 12 }}>{selectedProduct.subcategory}</div>
            <p>{selectedProduct.description}</p>
            <div style={{ fontSize: 12, color: "#fbbf24" }}><strong>Status:</strong> {selectedProduct.status || "READY"}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}><strong>Source screenshot:</strong> {selectedProduct.sourceScreenshot || "N/A"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label>Size / Option<select style={inputStyle} value={selectedSizeId} onChange={(e)=>setSelectedSizeId(e.target.value)}>{(selectedProduct.sizes||[]).length ? (selectedProduct.sizes||[]).map((s)=><option key={s.id} value={s.id}>{s.label}</option>) : <option value="">NEEDS REVIEW</option>}</select></label>
              <label>Quantity<input style={inputStyle} type="number" min={selectedProduct.moq || 1} value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} /></label>
              <label>Print Side<select style={inputStyle} value={selectedSided} onChange={(e)=>setSelectedSided(e.target.value)}>{(selectedProduct.sidedOptions||[]).length ? selectedProduct.sidedOptions.map((s)=><option key={s}>{s}</option>) : <option>NEEDS REVIEW</option>}</select></label>
              <label>Hardware<select style={inputStyle} value={selectedHardware} onChange={(e)=>setSelectedHardware(e.target.value)}>{(selectedProduct.hardwareOptions||[]).length ? selectedProduct.hardwareOptions.map((h)=><option key={h}>{h}</option>) : <option>NEEDS REVIEW</option>}</select></label>
            </div>
            <div style={{ marginTop: 10, border: "1px solid #334155", borderRadius: 10, padding: 10, background: "#0b1220" }}>
              <div><strong>Tier used:</strong> {tierLabel(activeTier)}</div>
              <div><strong>Retail each:</strong> {retailEach == null ? "Call for pricing" : `$${retailEach.toFixed(2)}`}</div>
              <div><strong>Retail total:</strong> {retailTotal == null ? "Call for pricing" : `$${retailTotal.toFixed(2)}`}</div>
            </div>
            {isNeedsReview ? <div style={{ marginTop: 12, color: "#fbbf24" }}>Catalog details must be verified from screenshot before quoting.</div> : <button onClick={addSelectedItem} style={{ marginTop: 12, borderRadius: 8, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", padding: "10px 14px", fontWeight: 700 }}>Add selected item to quote</button>}
          </>}
        </section>
      </div>

      <section style={{ marginTop: 14, border: "1px solid #334155", borderRadius: 12, padding: 12, background: "#111827" }}>
        <h3 style={{ marginTop: 0 }}>Quote Items / Admin Detail</h3>
        {quoteItems.length === 0 ? <div style={{ color: "#94a3b8" }}>No items added yet.</div> : quoteItems.map((item) => (
          <div key={item.id} style={{ borderTop: "1px solid #334155", padding: "10px 0" }}>
            <div><strong>Product:</strong> {item.product}</div>
            <div><strong>Size:</strong> {item.size}</div>
            <div><strong>Print Side:</strong> {item.printSide}</div>
            <div><strong>Hardware:</strong> {item.hardware}</div>
            <div><strong>Qty:</strong> {item.qty}</div>
            <div><strong>Retail Each:</strong> {item.retailEach}</div>
            <div><strong>Retail Total:</strong> {item.retailTotal}</div>
          </div>
        ))}
      </section>
    </div>
  </main>;
}
