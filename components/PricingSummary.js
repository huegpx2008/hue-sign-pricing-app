import { useEffect, useState } from "react";
import ProductVisual from "./ProductVisual";
import VinylLayoutPreview from "./VinylLayoutPreview";
import SheetLayoutPreview from "./SheetLayoutPreview";
import { SelectedDetails } from "./FormControls";
import { money, num } from "../utils/pricingHelpers";

export default function PricingSummary({
  calc,
  activeProduct,
  product,
  productMap,
  products,
  width,
  height,
  qty,
  selectedDetails,
  multiplier,
  showBreakdown,
  setShowBreakdown,
  dtfSummary,
  isAdminView,
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quoteItems, setQuoteItems] = useState([]);
  const [emailQuoteToHue, setEmailQuoteToHue] = useState("jason@huegraphics.cc");
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("hue-quote-items") || "[]");
      if (Array.isArray(saved)) setQuoteItems(saved);
    } catch {}
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("hue-quote-items", JSON.stringify(quoteItems));
  }, [quoteItems]);
  const scrollToQuoteSummary = () => {
    if (typeof window === "undefined" || window.innerWidth > 800) return;
    document.getElementById("quote-summary-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isDtf = activeProduct === "dtfTransfers" && dtfSummary;
  const isScreenPrint = activeProduct === "screenPrinting" && dtfSummary;
  const summaryCalc = (isDtf || isScreenPrint) ? dtfSummary : calc;
  const priceEachText = isScreenPrint
    ? money(dtfSummary?.averagePricePerShirt || dtfSummary?.each || 0)
    : money(summaryCalc.each || 0);
  const buildCurrentQuoteItem = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    product: isDtf ? (dtfSummary?.dtfMode === "dtfOnly" ? "DTF Transfers Only" : "DTF Transfers") : isScreenPrint ? "Screen Printing" : calc.label,
    quantity: isDtf ? dtfSummary?.totalGarmentQty || 0 : isScreenPrint ? dtfSummary?.totalGarments || 0 : num(qty, 1),
    each: isScreenPrint ? dtfSummary?.averagePricePerShirt || dtfSummary?.each || 0 : summaryCalc.each || 0,
    total: summaryCalc.retail || 0,
    safeDetails: isDtf
      ? [
          `Style #: ${dtfSummary?.selectedStyle || "Not selected"}`,
          `Garment: ${dtfSummary?.selectedTitle || "Not selected"}`,
          `Color: ${dtfSummary?.selectedColor || "Not selected"}`,
        ]
      : isScreenPrint
      ? (dtfSummary?.lineItems || []).map((li) => `${li.style || "Style"} ${li.color ? `(${li.color})` : ""} Qty ${li.totalQty || 0}`)
      : [selectedDetails.size, selectedDetails.material, ...(selectedDetails.options || [])],
    adminDetails: [
      `Material Cost: ${money(summaryCalc.materialCost || 0)}`,
      `Direct Cost: ${money(summaryCalc.cost || 0)}`,
      `Profit: ${money(summaryCalc.profit || 0)}`,
    ],
  });
  const addToQuote = () => setQuoteItems((prev) => [...prev, buildCurrentQuoteItem()]);
  const removeQuoteItem = (id) => setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  const clearQuote = () => setQuoteItems([]);
  const quoteGrandTotal = quoteItems.reduce((sum, item) => sum + Number(item.total || 0), 0);

  const quoteLines = [
    "Hue Graphics & Apparel Quote",
    "",
    `Customer Name: ${customerName || "Not provided"}`,
    `Customer Email: ${customerEmail || "Not provided"}`,
    `Customer Phone: ${customerPhone || "Not provided"}`,
    "",
    "Quote Summary:",
    `Product: ${isDtf ? "DTF Transfers" : isScreenPrint ? "Screen Printing" : calc.label}`,
    `Quantity: ${isDtf ? dtfSummary?.totalGarmentQty || 0 : isScreenPrint ? dtfSummary?.totalGarments || 0 : num(qty, 1)}`,
    `Price Each: ${priceEachText}`,
    `Grand Total: ${money(summaryCalc.retail || 0)}`,
    "",
    "Selected Options/Details:",
    ...(isDtf
      ? [
          `Style #: ${dtfSummary?.selectedStyle || "Not selected"}`,
          `Garment: ${dtfSummary?.selectedTitle || "Not selected"}`,
          `Color: ${dtfSummary?.selectedColor || "Not selected"}`,
          `Sizes: ${Object.entries(dtfSummary?.sizeQuantities || {}).filter(([, v]) => Number(v) > 0).map(([k, v]) => `${k}(${v})`).join(", ") || "None"}`,
          `Print Locations: ${(dtfSummary?.selectedPrintLocations || []).length ? dtfSummary.selectedPrintLocations.join(", ") : "None selected"}`,
        ]
      : isScreenPrint
      ? [
          ...((dtfSummary?.lineItems || []).map((li, idx) => {
            const sizes = Object.entries(li.sizeQty || {}).filter(([, v]) => Number(v) > 0).map(([k, v]) => `${k}:${v}`).join(", ") || "None";
            return `Line ${idx + 1}: ${li.style || "Style not selected"} ${li.color ? `(${li.color})` : ""} • Qty ${li.totalQty || 0} • Sizes ${sizes} • ${money(li.retailPerShirt || 0)}/shirt`;
          })),
          ...((dtfSummary?.printLines || []).map((pl) => `${pl.name}: ${pl.colors} colors • ${money(pl.pricePerPrint)}/print`)),
          `Artwork/Setup Fee: ${money(dtfSummary?.setupFee || 0)}`,
        ]
      : selectedDetails.options.length
      ? selectedDetails.options
      : ["None"])
    ,
    "",
    "Please reply to this email if you’d like to move forward or have any questions.",
  ];

  const multiItemQuoteLines = quoteItems.length
    ? [
        "Hue Graphics & Apparel Quote",
        "",
        `Customer Name: ${customerName || "Not provided"}`,
        `Customer Email: ${customerEmail || "Not provided"}`,
        `Customer Phone: ${customerPhone || "Not provided"}`,
        "",
        "Quote Items:",
        ...quoteItems.flatMap((item, idx) => [
          `${idx + 1}. ${item.product}`,
          `   Qty: ${item.quantity}`,
          `   Price Each: ${money(item.each || 0)}`,
          `   Item Total: ${money(item.total || 0)}`,
          `   Details: ${(item.safeDetails || []).filter(Boolean).join("; ") || "None"}`,
          "",
        ]),
        `Grand Total: ${money(quoteGrandTotal)}`,
        "",
        "Please reply to this email if you’d like to move forward or have any questions.",
      ]
    : null;
  const quoteText = (multiItemQuoteLines || quoteLines).join("\n");
  const emailHref = `mailto:${encodeURIComponent(emailQuoteToHue || "jason@huegraphics.cc")}?${customerEmail ? `cc=${encodeURIComponent(customerEmail)}&` : ""}subject=${encodeURIComponent("Quote Request from Hue Graphics Quote Form")}&body=${encodeURIComponent(quoteText)}`;

  const handleCopyQuote = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(quoteText);
      return;
    }
    if (typeof window !== "undefined") window.alert("Clipboard not available on this browser.");
  };

  return (
    <>
      <aside className="summary sticky" id="quote-summary-anchor">
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.09)" }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Customer Contact</h3>
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)" }} placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)" }} placeholder="Customer Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)" }} placeholder="Customer Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)" }} placeholder="Email Quote To Hue" value={emailQuoteToHue} onChange={(e) => setEmailQuoteToHue(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="modeBtn" onClick={handleCopyQuote}>Copy Quote</button>
            <a className="modeBtn" href={emailQuoteToHue ? emailHref : "#"} onClick={(e) => { if (!emailQuoteToHue) e.preventDefault(); }} style={{ textDecoration: "none", textAlign: "center", lineHeight: "36px" }}>Email Quote</a>
          </div>
        </div>
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.09)" }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Quote Items</h3>
          <button className="modeBtn" onClick={addToQuote} style={{ width: "100%", marginBottom: 8 }}>Add to Quote</button>
          {quoteItems.length === 0 ? (
            <p style={{ margin: 0 }}>No quote items added yet.</p>
          ) : (
            <>
              {quoteItems.map((item, idx) => (
                <div key={item.id} style={{ marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.45)" }}>
                  <p style={{ margin: "0 0 4px" }}><strong>{idx + 1}. {item.product}</strong></p>
                  <p style={{ margin: "0 0 4px" }}>Qty {item.quantity} • {money(item.each || 0)} each • {money(item.total || 0)} total</p>
                  <p style={{ margin: "0 0 4px", fontSize: 13 }}>{(item.safeDetails || []).filter(Boolean).join(" • ")}</p>
                  {isAdminView && <p style={{ margin: "0 0 6px", fontSize: 12 }}>Admin: {(item.adminDetails || []).filter(Boolean).join(" • ")}</p>}
                  <button className="modeBtn" onClick={() => removeQuoteItem(item.id)}>Remove</button>
                </div>
              ))}
              <p style={{ margin: "8px 0" }}><strong>Grand Total: {money(quoteGrandTotal)}</strong></p>
              <button className="modeBtn" onClick={clearQuote}>Clear Quote</button>
            </>
          )}
        </div>
        <h2>{isAdminView ? "Suggested Retail" : "Customer Quote"}</h2>
        <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(summaryCalc.retail)}</div>
        {!(isScreenPrint && (dtfSummary.lineItems || []).length > 1) && <p>Each: <strong>{money(summaryCalc.each)}</strong></p>}
        {isAdminView && <p>Profit: <strong>{money(summaryCalc.profit)}</strong></p>}
        <hr />
        <p>Product: {isDtf ? "DTF Transfers" : isScreenPrint ? "Screen Printing" : calc.label}</p>
        {!isDtf && !isScreenPrint && isAdminView && <p>Total Sq Ft: {calc.totalSqFt?.toFixed(2)}</p>}

        {isAdminView && <button className="modeBtn" style={{ marginBottom: 10 }} onClick={() => setShowBreakdown((v) => !v)}>{showBreakdown ? "Hide" : "Show"} Detailed Breakdown</button>}

        {!isDtf && showBreakdown && calc.actualTotalSqFt !== undefined && <p>Actual Sq Ft: {calc.actualTotalSqFt.toFixed(2)}</p>}
        {!isDtf && showBreakdown && calc.effectiveSqFtEach !== undefined && <p>Effective Sq Ft Each: {showBreakdown && calc.effectiveSqFtEach.toFixed(2)}</p>}
        {!isDtf && showBreakdown && calc.billableSqFtEach !== undefined && <p>Billable Sq Ft Each: {showBreakdown && calc.billableSqFtEach.toFixed(2)}</p>}
        {!isDtf && showBreakdown && calc.layoutWidth !== undefined && calc.layoutHeight !== undefined && (
          <p>Layout Size: {showBreakdown && calc.layoutWidth}" x {calc.layoutHeight}"</p>
        )}
        {!isDtf && showBreakdown && calc.rawBillableSqFt !== undefined && <p>Raw Gang Sq Ft: {showBreakdown && calc.rawBillableSqFt.toFixed(2)}</p>}
        {!isDtf && showBreakdown && calc.billingMode !== undefined && <p>Billing Mode: {showBreakdown && calc.billingMode}</p>}
        {!isDtf && showBreakdown && calc.normalSqFt !== undefined && <p>Normal Layout Sq Ft: {showBreakdown && calc.normalSqFt.toFixed(2)}</p>}
        {!isDtf && calc.rotatedSqFt !== undefined && <p>Rotated Layout Sq Ft: {calc.rotatedSqFt.toFixed(2)}</p>}

        {showBreakdown && calc.tierPrice !== undefined && <p>Tier Price Total: {money(calc.tierPrice)}</p>}
        {showBreakdown && calc.costMarginPrice !== undefined && <p>Cost + Margin Price: {money(calc.costMarginPrice)}</p>}
        {showBreakdown && calc.shopPrice !== undefined && <p>Shop Sq Ft Price: {money(calc.shopPrice)}</p>}
        {showBreakdown && calc.sheetsUsed !== undefined && <p>Sheets Used: {showBreakdown && calc.sheetsUsed.toFixed(2)}</p>}
        {showBreakdown && calc.sheetsRounded !== undefined && <p>Sheets Rounded: {showBreakdown && calc.sheetsRounded}</p>}
        {showBreakdown && calc.piecesPerSheet !== undefined && <p>Pieces Per Sheet: {showBreakdown && calc.piecesPerSheet}</p>}
        {showBreakdown && calc.sheetLayout !== undefined && <p>Sheet Layout: {showBreakdown && calc.sheetLayout}</p>}
        {showBreakdown && calc.costPerPiece !== undefined && <p>Cost Per Piece: {money(calc.costPerPiece)}</p>}
        {isAdminView && <p>Material Cost: {money(summaryCalc.materialCost)}</p>}
        {calc.standOffQty !== undefined && calc.standOffQty > 0 && (
          <>
            <p>Stand-Off Qty: {calc.standOffQty} ({calc.standOffColor})</p>
            <p>Stand-Off Direct Cost: {money(calc.standOffDirectCost)}</p>
            <p>Stand-Off Retail Charge: {money(calc.standOffRetailCharge)}</p>
          </>
        )}
        {isAdminView && <p>Shipping: {money(summaryCalc.shipping)}</p>}
        {isAdminView && <p>Direct Cost: {money(summaryCalc.cost)}</p>}
        {isAdminView && <p>Actual Margin: {summaryCalc.margin.toFixed(1)}%</p>}
        {isAdminView && <p>Multiplier: {num(multiplier, 1)}x</p>}
        {isAdminView && isDtf && (
          <>
            {showBreakdown && (
              <>
                <hr />
                <p><strong>DTF Profit Breakdown</strong></p>
                <p><strong>Apparel Profit:</strong> {money(dtfSummary.apparelRetailSubtotal - dtfSummary.apparelDirectCost)}</p>
                <p><strong>DTF Material Profit:</strong> {money(dtfSummary.dtfRetailSubtotal - dtfSummary.dtfMaterialCost)}</p>
                <p><strong>Sleeve Add-On Retail:</strong> {money(dtfSummary.sleeveRetailAddOnTotal)}</p>
                <p><strong>Sleeve Add-On Profit:</strong> {money(dtfSummary.sleeveRetailAddOnTotal)}</p>
                <p><strong>Total Profit:</strong> {money(summaryCalc.profit)}</p>
              </>
            )}
            <hr />
            <p><strong>Apparel Direct:</strong> {money(dtfSummary.apparelDirectCost)}</p>
            <p><strong>Apparel Retail Subtotal:</strong> {money(dtfSummary.apparelRetailSubtotal)}</p>
            <p><strong>DTF Material Cost:</strong> {money(dtfSummary.dtfMaterialCost)}</p>
            <p><strong>DTF Retail Subtotal:</strong> {money(dtfSummary.dtfRetailSubtotal)}</p>
            <p><strong>Size Upcharges:</strong> {money(dtfSummary.sizeUpchargeTotal)}</p>
            <p><strong>Sleeve Retail Add-On:</strong> {money(dtfSummary.sleeveRetailAddOnTotal)}</p>
            <p><strong>Roll Length Used:</strong> {dtfSummary.rollLengthUsed.toFixed(2)}"</p>
            <p><strong>Transfer Count:</strong> {dtfSummary.transferCount}</p>
          </>
        )}

        {!isDtf && !isScreenPrint && <ProductVisual product={activeProduct || product} comingSoon={!activeProduct} />}
        {!isDtf && (activeProduct === "vinyl" || activeProduct === "reflective") && <VinylLayoutPreview calc={calc} />}
        {!isDtf && (activeProduct === "foamcore" || activeProduct === "pvc") && <SheetLayoutPreview calc={calc} />}
        {isDtf ? (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.08)", color: "#e5e7eb", fontSize: 14, lineHeight: 1.35 }}>
            <h3 style={{ marginTop: 0 }}>{isAdminView ? "Selected Details" : "DTF Customer Quote"}</h3>
            <p><strong>Product:</strong> {dtfSummary.dtfMode === "dtfOnly" ? "DTF Transfers Only" : "DTF Transfers"}</p>
            {dtfSummary.dtfMode !== "dtfOnly" && <p><strong>Style #:</strong> {dtfSummary.selectedStyle || "Not selected"}</p>}
            {dtfSummary.dtfMode !== "dtfOnly" && <p><strong>Garment:</strong> {dtfSummary.selectedTitle || "Not selected"}</p>}
            {dtfSummary.dtfMode !== "dtfOnly" && <p><strong>Color:</strong> {dtfSummary.selectedColor || "Not selected"}</p>}
            {dtfSummary.dtfMode === "dtfOnly" && <p><strong>Transfer Size:</strong> {dtfSummary.dtfOnlyWidth}" x {dtfSummary.dtfOnlyHeight}"</p>}
            <p><strong>{dtfSummary.dtfMode === "dtfOnly" ? "DTF Quantity" : "Total Garments"}:</strong> {dtfSummary.totalGarmentQty}</p>
            {dtfSummary.dtfMode !== "dtfOnly" && <p><strong>Sizes:</strong> {Object.entries(dtfSummary.sizeQuantities || {}).filter(([, v]) => Number(v) > 0).map(([k, v]) => `${k}(${v})`).join(", ") || "None"}</p>}
            {dtfSummary.dtfMode !== "dtfOnly" && <p><strong>Print Locations:</strong> {dtfSummary.selectedPrintLocations.length ? dtfSummary.selectedPrintLocations.join(", ") : "None selected"}</p>}
            {dtfSummary.bringYourOwnApparel && !isAdminView && <p><strong>Bring your own apparel selected.</strong> Bring your own apparel option available. Please call for details.</p>}
            <p><strong>Price per garment:</strong> {money(dtfSummary.each)}</p>
            <p><strong>Final total:</strong> {money(dtfSummary.retail)}</p>
            {isAdminView && <p><strong>SanMar Item:</strong> {dtfSummary.productDisplay}</p>}
            {isAdminView && <p><strong>Apparel Cost Used:</strong> {money(dtfSummary.apparelCostUsed)}</p>}
            {isAdminView && <p><strong>Roll Length Used:</strong> {dtfSummary.rollLengthUsed.toFixed(2)}"</p>}
            {isAdminView && <p><strong>Transfer Count:</strong> {dtfSummary.transferCount}</p>}
            {isAdminView && <p><strong>Size Upcharges:</strong> {money(dtfSummary.sizeUpchargeTotal)}</p>}
          </div>
        ) : isScreenPrint ? (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.08)", color: "#e5e7eb", fontSize: 14, lineHeight: 1.35 }}>
            <h3 style={{ marginTop: 0 }}>Screen Printing Details</h3>
            <p><strong>Product:</strong> Screen Printing</p>
            {(dtfSummary.lineItems || []).map((li, idx) => (
              <div key={`${li.id}-${idx}`} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid rgba(148,163,184,0.35)" }}>
                <p><strong>Line {idx + 1}:</strong> {li.style} — {li.title || ""}</p>
                <p><strong>Color:</strong> {li.color || "Not selected"}</p>
                <p><strong>Sizes:</strong> {Object.entries(li.sizeQty || {}).filter(([,v]) => Number(v) > 0).map(([k,v]) => `${k}:${v}`).join(", ") || "None"}</p>
                <p><strong>Total Qty:</strong> {li.totalQty}</p>
                {isAdminView && <p><strong>CASE_PRICE (avg):</strong> {money(li.casePrice || 0)}</p>}
                {isAdminView && <p><strong>Product Markup %:</strong> {li.productMarkupPercent || dtfSummary.productMarkupPercent}%</p>}
                <p><strong>Final Retail Subtotal:</strong> {money(li.finalRetailSubtotal || 0)}</p>
                <p><strong>Print Charge Per Shirt:</strong> {money(li.printChargePerShirt || 0)}</p>
                <p><strong>Final Retail Per Shirt:</strong> {money(li.retailPerShirt || 0)}</p>
              </div>
            ))}
            <p><strong>Total Garments:</strong> {dtfSummary.totalGarments}</p>
            {(dtfSummary.printLines || []).map((pl, idx) => (
              <p key={`${pl.id}-${idx}`}><strong>{pl.name}:</strong> {pl.colors} colors • {pl.pricingType} • {money(pl.pricePerPrint)}/print • {money(pl.subtotal)}</p>
            ))}
            <p><strong>Artwork/Setup Fee:</strong> {money(dtfSummary.setupFee)}</p>
            {isAdminView && <p><strong>Apparel Direct Cost:</strong> {money(dtfSummary.apparelDirectCost)}</p>}
            <p><strong>Apparel Retail Subtotal:</strong> {money(dtfSummary.apparelRetailSubtotal)}</p>
            <p><strong>Print Charge Subtotal:</strong> {money(dtfSummary.printChargeSubtotal)}</p>
            <p><strong>Final Retail:</strong> {money(dtfSummary.retail)}</p>
            <p><strong>Average price per shirt:</strong> {money(dtfSummary.averagePricePerShirt || dtfSummary.each)}</p>
            {isAdminView && <p><strong>Profit:</strong> {money(dtfSummary.profit)}</p>}
          </div>
        ) : <SelectedDetails details={selectedDetails} />}
      </aside>

      <div className="mobilePrice" role="button" tabIndex={0} onClick={scrollToQuoteSummary} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && scrollToQuoteSummary()} style={{ cursor: "pointer" }}>
        <div className="mobilePriceTop"><strong>Suggested Retail {money(summaryCalc.retail).replace("$", "$ ")}</strong></div>
        {isDtf ? (
          <>
            <div className="mobileMeta">
              DTF Transfers • {dtfSummary.totalGarmentQty || 0} garments
              {dtfSummary.productDisplay ? ` • ${dtfSummary.productDisplay}` : ""}
            </div>
            <div className="mobileOptions">
              {(dtfSummary.selectedPrintLocations || []).length ? dtfSummary.selectedPrintLocations.join(" • ") : "No print locations selected"}
              {dtfSummary.each ? ` • ${money(dtfSummary.each)}/garment` : ""}
              {` • Total: ${money(dtfSummary.retail)}`}
            </div>
          </>
        ) : isScreenPrint ? (
          <>
            <div className="mobileMeta">Screen Printing • {dtfSummary.totalGarments || 0} garments • {(dtfSummary.lineItems || []).filter((li) => li.totalQty > 0).length} style(s)</div>
            <div className="mobileOptions">{(dtfSummary.printLines || []).length ? (dtfSummary.printLines || []).map((pl) => `${pl.name} ${pl.colors}-color`).join(" • ") : "No print locations selected"} • Total: {money(dtfSummary.retail)}</div>
          </>
        ) : (
          <>
            <div className="mobileMeta">{productMap[product]?.label || products[activeProduct]} • {num(width)}&quot; x {num(height)}&quot; • Qty {num(qty, 1)}</div>
            <div className="mobileOptions">{selectedDetails.options.length ? `Options: ${selectedDetails.options.join(", ")}` : "Options: None"}</div>
          </>
        )}
      </div>
    </>
  );
}
