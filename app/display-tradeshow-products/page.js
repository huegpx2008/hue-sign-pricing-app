"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { displayTradeshowCatalog, displayTradeshowTagList } from "../../data/displayTradeshowConfig";

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" };

const getTierForQuantity = (tiers, quantity) =>
  tiers.find((tier) => quantity >= tier.min && (tier.max === null || quantity <= tier.max)) || null;

const tierLabel = (tier) => (tier ? `${tier.min}${tier.max === null ? "+" : `-${tier.max}`}` : "N/A");

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
    return displayTradeshowCatalog.filter((product) => {
      const tagOk = activeTag === "All" || product.tags.includes(activeTag);
      const text = `${product.name} ${product.subcategory} ${product.description}`.toLowerCase();
      return tagOk && (!needle || text.includes(needle));
    });
  }, [activeTag, search]);

  const selectedProduct = useMemo(
    () => displayTradeshowCatalog.find((product) => product.id === selectedProductId) || filteredProducts[0] || null,
    [filteredProducts, selectedProductId]
  );

  const selectedSize = selectedProduct?.sizes.find((size) => size.id === selectedSizeId) || selectedProduct?.sizes[0] || null;

  const activeTiers = selectedSize?.tierPricingBySide?.[selectedSided] || selectedSize?.tierPricing || [];

  useEffect(() => {
    if (!selectedProduct) return;
    setSelectedSizeId(selectedProduct.sizes[0]?.id || "");
    setSelectedSided(selectedProduct.sidedOptions[0] || "N/A");
    setSelectedHardware(selectedProduct.hardwareOptions[0] || "N/A");
    setQuantity(selectedProduct.moq || 1);
  }, [selectedProductId]);

  const activeTier = useMemo(() => {
    if (!selectedSize) return null;
    return getTierForQuantity(activeTiers, quantity);
  }, [activeTiers, quantity, selectedSize]);

  const isCallForPricing = !activeTier || activeTier.retailEach === "CALL";
  const retailEach = isCallForPricing ? null : Number(activeTier.retailEach);
  const retailTotal = retailEach == null ? null : retailEach * Number(quantity || 0);

  const addToQuote = () => {
    if (!selectedProduct || !selectedSize) return;

    setQuoteItems((prev) => [
      ...prev,
      {
        id: `${selectedProduct.id}-${Date.now()}`,
        productName: selectedProduct.name,
        description: selectedProduct.description,
        selectedSize: selectedSize.label,
        selectedPrintSide: selectedSided,
        selectedHardware,
        quantity,
        retailEach: retailEach == null ? "Call for pricing" : `$${retailEach.toFixed(2)}`,
        retailTotal: retailTotal == null ? "Call for pricing" : `$${retailTotal.toFixed(2)}`,
        tierUsed: tierLabel(activeTier),
        notes: [
          selectedProduct.freeShipping ? "Free shipping" : null,
          selectedProduct.shippingNotes || null,
          isCallForPricing ? "Call for pricing tier selected" : null,
        ]
          .filter(Boolean)
          .join(" • "),
      },
    ]);
  };

  if (!isAdminView) {
    return (
      <main style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", Verdana, sans-serif', minHeight: "100vh", padding: 20 }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 16, color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>
            ← Back to main pricing app
          </Link>
          <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20 }}>
            <h1 style={{ marginTop: 0 }}>Display / Tradeshow Products</h1>
            <div style={{ marginTop: 16, border: "1px dashed #94a3b8", borderRadius: 10, padding: 16 }}>
              <strong>Coming Soon</strong>
              <div>Display / Tradeshow Products coming soon.</div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", Verdana, sans-serif', minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 16, color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>
          ← Back to main pricing app
        </Link>

        <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 20 }}>
          <h1 style={{ marginTop: 0 }}>Display / Tradeshow Products</h1>
          <p style={{ color: "#475569" }}>Retail-only pricing from uploaded catalog screenshots. Margin is not applied yet.</p>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.5fr)", gap: 16 }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <label>Product search<input style={inputStyle} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search display products" /></label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
                {["All", ...displayTradeshowTagList].map((tag) => (
                  <button key={tag} onClick={() => setActiveTag(tag)} style={{ borderRadius: 999, border: activeTag === tag ? "2px solid #1d4ed8" : "1px solid #cbd5e1", background: activeTag === tag ? "#dbeafe" : "#fff", padding: "6px 10px" }}>
                    {tag}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {filteredProducts.map((product) => (
                  <button key={product.id} onClick={() => setSelectedProductId(product.id)} style={{ textAlign: "left", borderRadius: 8, border: selectedProductId === product.id ? "2px solid #1d4ed8" : "1px solid #cbd5e1", background: "#fff", padding: "8px 10px" }}>
                    <div style={{ fontWeight: 700 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{product.subcategory}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
              {selectedProduct && selectedSize ? (
                <>
                  <h3 style={{ marginTop: 0, marginBottom: 6 }}>{selectedProduct.name}</h3>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{selectedProduct.subcategory}</div>
                  <p style={{ marginTop: 0 }}>{selectedProduct.description}</p>
                  <p style={{ marginTop: 0, fontSize: 12, color: "#334155" }}><strong>Reference:</strong> Display catalog screenshot ({selectedProduct.imageReference})</p>
                  {selectedProduct.referenceStatus === "Needs review" ? <p style={{ marginTop: 0, fontSize: 12, color: "#b45309" }}><strong>Status:</strong> Needs review (confirm real screenshot filename in public/data/display)</p> : null}
                  {selectedProduct.adminNotes?.length ? <p style={{ marginTop: 0, fontSize: 12, color: "#334155" }}><strong>Admin note:</strong> {selectedProduct.adminNotes.join(" ")}</p> : null}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <label>Size / Option<select style={inputStyle} value={selectedSizeId} onChange={(e) => setSelectedSizeId(e.target.value)}>{selectedProduct.sizes.length ? selectedProduct.sizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>) : <option value="">Needs review</option>}</select></label>
                    <label>{selectedProduct.soldInSets ? "Set Quantity" : "Quantity"}{selectedProduct.soldInSets ? <select style={inputStyle} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>{(selectedProduct.setQuantities || []).map((q) => <option key={q} value={q}>{q}</option>)}</select> : <input style={inputStyle} type="number" min={selectedProduct.moq || 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />}</label>
                    <label>Print Side<select style={inputStyle} value={selectedSided} onChange={(e) => setSelectedSided(e.target.value)}>{selectedProduct.sidedOptions.map((side) => <option key={side} value={side}>{side}</option>)}</select></label>
                    <label>Hardware<select style={inputStyle} value={selectedHardware} onChange={(e) => setSelectedHardware(e.target.value)}>{selectedProduct.hardwareOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                  </div>

                  <div style={{ marginTop: 12, borderRadius: 10, border: "1px solid #e2e8f0", padding: 10, background: "#f8fafc" }}>
                    <div><strong>MOQ:</strong> {selectedProduct.moq}</div>
                    <div><strong>Tier used:</strong> {tierLabel(activeTier)}</div>
                    <div><strong>Retail price each:</strong> {retailEach == null ? "Call for pricing" : `$${retailEach.toFixed(2)}`}</div>
                    <div><strong>Retail total:</strong> {retailTotal == null ? "Call for pricing" : `$${retailTotal.toFixed(2)}`}</div>
                    <div><strong>Flags:</strong> {[selectedProduct.freeShipping ? "Free Shipping" : null, selectedProduct.soldInSets ? "Sold in Sets" : null, selectedProduct.replacementGraphicsSupported ? "Replacement Graphics Supported" : null, isCallForPricing ? "Call for Pricing" : null].filter(Boolean).join(" • ") || "None"}</div>
                  </div>

                  <button onClick={addToQuote} style={{ marginTop: 12, borderRadius: 8, border: "1px solid #1d4ed8", background: "#1d4ed8", color: "#fff", padding: "10px 14px", fontWeight: 700 }}>
                    Add selected item to quote
                  </button>
                </>
              ) : (
                <div>No products available for current filter.</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16, border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Quote Items (Admin Detail)</h3>
            {quoteItems.length === 0 ? <div>No items added yet.</div> : quoteItems.map((item) => (
              <div key={item.id} style={{ borderTop: "1px solid #e2e8f0", padding: "10px 0" }}>
                <strong>{item.productName}</strong>
                <div>{item.description}</div>
                <div>Selected Size: {item.selectedSize}</div>
                <div>Selected Print Side: {item.selectedPrintSide}</div>
                <div>Selected Hardware Option: {item.selectedHardware}</div>
                <div>Quantity: {item.quantity}</div>
                <div>Retail Price Each: {item.retailEach}</div>
                <div>Retail Total: {item.retailTotal}</div>
                <div>Tier Used: {item.tierUsed}</div>
                <div>Notes: {item.notes || "None"}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
