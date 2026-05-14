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
  activeTheme,
}) {
  const formatSizeBreakdown = (sizeQty = {}) => Object.entries(sizeQty).filter(([, v]) => Number(v) > 0).map(([k, v]) => `${k}(${v})`).join(", ") || "None";
  const formatPrintLocations = (printLines = []) => printLines.filter((pl) => pl?.colors > 0).map((pl) => `${pl.name} ${pl.colors}-color`).join(", ") || "None selected";
  const formatSizePriceBreakdown = (tiers = []) => tiers.filter((t) => Number(t?.qty || 0) > 0).map((t) => `${t.label || t.size}: ${t.qty} @ ${money(t.priceEach ?? t.garmentPriceEach ?? 0)} each`);
  const screenPriceLabel = (size) => (["S", "M", "L", "XL"].includes(size) ? "S-XL" : size);
  const getScreenCustomerPriceTiers = (lineItem = {}) => {
    const grouped = new Map();
    (lineItem.sizePriceBreakdown || []).forEach((tier) => {
      const label = screenPriceLabel(tier.size);
      const existing = grouped.get(label);
      const qty = Number(tier.qty || 0);
      const priceEach = Number(tier.garmentPriceEach || 0) + Number(lineItem.printChargePerShirt || 0);
      if (!existing) grouped.set(label, { label, qty, priceEach });
      else grouped.set(label, { ...existing, qty: existing.qty + qty, priceEach: Math.min(existing.priceEach, priceEach) });
    });
    return ["S-XL", "2XL", "3XL", "4XL", "5XL", "6XL"].map((label) => grouped.get(label)).filter((x) => x && x.qty > 0);
  };

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quoteItems, setQuoteItems] = useState([]);
  const emailQuoteToHue = "jason@huegraphics.cc";
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

  const hasProductSelected = Boolean(product);
  const isDtf = activeProduct === "dtfTransfers" && dtfSummary;
  const isScreenPrint = activeProduct === "screenPrinting" && dtfSummary;
  const isEmbroidery = activeProduct === "embroidery" && dtfSummary;
  const dtfData = dtfSummary || {};
  const summaryCalc = (isDtf || isScreenPrint || isEmbroidery) ? dtfSummary : calc;
  const getCurrentItemCustomerDetailLines = () => {
    if (isDtf) {
      return [
        `Product: ${dtfSummary?.dtfMode === "dtfOnly" ? "DTF Transfers Only" : "DTF Transfers"}`,
        `Style #: ${dtfSummary?.selectedStyle || "Not selected"}`,
        `Garment: ${dtfSummary?.selectedTitle || "Not selected"}`,
        `Color: ${dtfSummary?.selectedColor || "Not selected"}`,
        `Sizes: ${formatSizeBreakdown(dtfSummary?.sizeQuantities || {})}`,
        `Total Qty: ${dtfSummary?.totalGarmentQty || 0}`,
        `Print Locations: ${((dtfSummary?.selectedPrintLocations || []).length ? dtfSummary.selectedPrintLocations.join(", ") : "None selected")}`,
        ...((dtfSummary?.sizePriceBreakdown || []).length
          ? ["Price Breakdown:", ...formatSizePriceBreakdown(dtfSummary?.sizePriceBreakdown || []).map((line) => `- ${line}`)]
          : [`Price Each: ${money(dtfSummary?.each || 0)}`]),
        `Total: ${money(dtfSummary?.retail || 0)}`,
      ];
    }
    if (isScreenPrint) {
      const lineItems = (dtfSummary?.lineItems || []).flatMap((li) => {
        if (!li || Number(li.totalQty || 0) <= 0) return [];
        return [
          `Style: ${li.style || "Not selected"}${li.title ? ` - ${li.title}` : ""}`,
          `Color: ${li.color || "Not selected"}`,
          `Sizes: ${formatSizeBreakdown(li.sizeQty || {})}`,
          `Total Qty: ${li.totalQty || 0}`,
          `Print Locations: ${formatPrintLocations(dtfSummary?.printLines || [])}`,
          ...((li.sizePriceBreakdown || []).length
            ? ["Price Breakdown:", ...getScreenCustomerPriceTiers(li).map((tier) => `- ${tier.label} Price Each: ${money(tier.priceEach)}`)]
            : [`Price Each: ${money(li.retailPerShirt || 0)}`]),
          `Item Total: ${money(li.finalRetailSubtotal || 0)}`,
          "",
        ];
      });
      return ["Product: Screen Printing", ...lineItems, `Grand Total: ${money(dtfSummary?.retail || 0)}`].filter((line, idx, arr) => !(line === "" && (idx === arr.length - 1 || arr[idx + 1] === "")));
    }
    return [
      `Product: ${calc.label}`,
      `Size: ${selectedDetails?.size || `${num(width)}" x ${num(height)}"`}`,
      `Quantity: ${selectedDetails?.qty || num(qty, 1)}`,
      ...(selectedDetails?.material ? [selectedDetails.material] : []),
      ...(selectedDetails?.options?.length ? [`Options: ${selectedDetails.options.join(", ")}`] : []),
      ...(selectedDetails?.sheetHint ? [selectedDetails.sheetHint] : []),
      ...(selectedDetails?.sheetAddMore ? [selectedDetails.sheetAddMore] : []),
      ...(selectedDetails?.printSize ? [`Print/Decal Size: ${selectedDetails.printSize}`] : []),
      `Price Each: ${money(summaryCalc.each || 0)}`,
      `Total: ${money(summaryCalc.retail || 0)}`,
    ];
  };
  const buildCurrentQuoteItem = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    product: isDtf ? (dtfSummary?.dtfMode === "dtfOnly" ? "DTF Transfers Only" : "DTF Transfers") : isScreenPrint ? "Screen Printing" : isEmbroidery ? "Embroidery" : calc.label,
    quantity: isDtf ? dtfSummary?.totalGarmentQty || 0 : (isScreenPrint || isEmbroidery) ? dtfSummary?.totalGarments || 0 : selectedDetails?.qty || num(qty, 1),
    each: (isScreenPrint || isEmbroidery) ? dtfSummary?.averagePricePerShirt || dtfSummary?.each || 0 : summaryCalc.each || 0,
    total: summaryCalc.retail || 0,
    safeDetails: getCurrentItemCustomerDetailLines(),
    adminDetails: [
      `Material Cost: ${money(summaryCalc.materialCost || 0)}`,
      `Direct Cost: ${money(summaryCalc.cost || 0)}`,
      `Profit: ${money(summaryCalc.profit || 0)}`,
    ],
  });
  const addToQuote = () => {
    if (!hasProductSelected) return;
    setQuoteItems((prev) => [...prev, buildCurrentQuoteItem()]);
  };
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
    ...getCurrentItemCustomerDetailLines(),
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
          ...((item.safeDetails || []).map((line) => `   ${line}`)),
          "",
        ]),
        `Grand Total: ${money(quoteGrandTotal)}`,
        "",
        "Please reply to this email if you’d like to move forward or have any questions.",
      ]
    : null;
  const quoteText = (multiItemQuoteLines || quoteLines).join("\n");
  const emailHref = `mailto:${encodeURIComponent(emailQuoteToHue || "jason@huegraphics.cc")}?${customerEmail ? `cc=${encodeURIComponent(customerEmail)}&` : ""}subject=${encodeURIComponent("Quote Request from Hue Graphics Quote Form")}&body=${encodeURIComponent(quoteText)}`;


  const mobileMeta = (() => {
    if (activeProduct === "businessCards") {
      const side = selectedDetails?.options?.find((o) => o.includes("Sided")) || "Single Sided";
      return {
        line1: `Business Cards • Qty ${selectedDetails?.qty || num(qty, 1)} • ${side}`,
        line2: `Price Each ${money(summaryCalc.each || 0)} • Total ${money(summaryCalc.retail || 0)}`,
      };
    }
    if (activeProduct === "handheld16ptPaper") {
      const size = selectedDetails?.size || "Handheld";
      return {
        line1: `Handheld 16pt Paper • ${size} • Qty ${num(qty, 1)}`,
        line2: `${calc.piecesPerSheet || 1} per sheet • Requires ${calc.sheetsRounded || 1} sheets`,
        line3: `Price Each ${money(summaryCalc.each || 0)} • Total ${money(summaryCalc.retail || 0)}`,
      };
    }
    if (activeProduct === "carbonless") {
      return {
        line1: `Carbonless Forms • ${selectedDetails?.options?.find((o) => o.startsWith("Form Type:"))?.replace("Form Type: ", "") || ""} • Qty ${selectedDetails?.qty || num(qty, 1)}`,
        line2: `${selectedDetails?.size || ""} • ${selectedDetails?.options?.filter((o) => ["Print Type", "Print Sides", "Sequential Numbering", "Wraparound Cover", "Booked Sets", "Rush Order"].some((k) => o.includes(k))).join(" • ") || "Options: None"}`,
        line3: `Price Each ${money(summaryCalc.each || 0)} • Total ${money(summaryCalc.retail || 0)}`,
      };
    }
    if (activeProduct === "doorHangers") {
      const typeLine = selectedDetails?.options?.find((o) => o.startsWith("Type/Color:"))?.replace("Type/Color: ", "") || "";
      const inkLine = selectedDetails?.options?.find((o) => o.startsWith("Ink:"))?.replace("Ink: ", "") || "";
      const backLine = selectedDetails?.options?.find((o) => o.startsWith("Back Printing:"))?.replace("Back Printing: ", "") || "No";
      const perfLine = selectedDetails?.options?.find((o) => o.startsWith("Perforation:"))?.replace("Perforation: ", "") || "No";
      return {
        line1: `Door Hangers • ${selectedDetails?.size || ""} • Qty ${selectedDetails?.qty || num(qty, 1)}`,
        line2: typeLine,
        line3: `${inkLine} • ${backLine === "No" ? "No Back Printing" : backLine}${perfLine !== "No" ? ` • ${perfLine}` : ""}`,
      };
    }
    return {
      line1: `${productMap[product]?.label || products[activeProduct]} • ${num(width)}" x ${num(height)}" • Qty ${num(qty, 1)}`,
      line2: selectedDetails.options.length ? `Options: ${selectedDetails.options.join(", ")}` : "Options: None",
      line3: `Price Each ${money(summaryCalc.each || 0)} • Total ${money(summaryCalc.retail || 0)}`,
    };
  })();

  const handleCopyQuote = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(quoteText);
      return;
    }
    if (typeof window !== "undefined") window.alert("Clipboard not available on this browser.");
  };

  return (
    <>
      <aside className="summary sticky" id="quote-summary-anchor" style={{ borderTop: `1px solid ${activeTheme?.accentSoft || "rgba(56,189,248,.35)"}`, boxShadow: `0 10px 30px rgba(15,23,42,.09), 0 0 0 1px ${activeTheme?.summaryBorder || "rgba(56,189,248,.5)"}, 0 0 20px ${activeTheme?.accentGlow || "rgba(56,189,248,.2)"}` }}>
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.09)" }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Customer Contact</h3>
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)" }} placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)" }} placeholder="Customer Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)" }} placeholder="Customer Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: ".04em", marginBottom: 6 }}>SENDING QUOTE TO HUE</label>
          <input style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid rgba(148,163,184,.5)", opacity: 0.9 }} value={emailQuoteToHue} readOnly />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button className="modeBtn" onClick={handleCopyQuote}>Copy Quote</button>
            <a className="modeBtn" href={emailQuoteToHue ? emailHref : "#"} onClick={(e) => { if (!emailQuoteToHue) e.preventDefault(); }} style={{ textDecoration: "none", textAlign: "center", lineHeight: "36px" }}>SUBMIT / EMAIL QUOTE</a>
          </div>
        </div>
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.09)" }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Quote Items</h3>
          <button className="modeBtn" onClick={addToQuote} disabled={!hasProductSelected} style={{ width: "100%", marginBottom: 8, opacity: hasProductSelected ? 1 : 0.6 }}>Add Selected Item to Quote</button>
          {quoteItems.length === 0 ? (
            <p style={{ margin: 0 }}>No quote items added yet.</p>
          ) : (
            <>
              {quoteItems.map((item, idx) => (
                <div key={item.id} style={{ marginBottom: 8, padding: 8, borderRadius: 8, border: `1px solid ${activeTheme?.divider || "rgba(148,163,184,.45)"}` }}>
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
        <h2>{isAdminView ? "Suggested Retail" : "Selected Item Preview"}</h2>
        <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(hasProductSelected ? summaryCalc.retail : 0)}</div>
        {hasProductSelected && !isScreenPrint && !isEmbroidery && !isDtf && !(isScreenPrint && (dtfData.lineItems || []).length > 1) && <p>Each: <strong>{money(summaryCalc.each || 0)}</strong></p>}
        {hasProductSelected && isDtf && (dtfData.dtfMode !== "dtfOnly") && (
          <div>
            {(dtfData.sizePriceBreakdown || []).filter((tier) => Number(tier.qty || 0) > 0).map((tier) => (
              <p key={`top-dtf-${tier.label}`} style={{ margin: "2px 0" }}><strong>{tier.label} Price Each:</strong> {money(tier.priceEach || 0)}</p>
            ))}
          </div>
        )}
        {hasProductSelected && isDtf && (dtfData.dtfMode === "dtfOnly") && <p>Each: <strong>{money(summaryCalc.each || 0)}</strong></p>}
        {hasProductSelected && isScreenPrint && !isAdminView && (dtfData.lineItems || []).filter((li) => Number(li.totalQty || 0) > 0).map((li, idx) => (
          <div key={`top-sp-tier-${li.id || idx}`}>
            {(dtfData.lineItems || []).length > 1 && <p style={{ marginBottom: 4 }}><strong>{li.style}</strong> {li.color ? `(${li.color})` : ""}</p>}
            {getScreenCustomerPriceTiers(li).map((tier) => (
              <p key={`top-sp-${li.id || idx}-${tier.label}`} style={{ margin: "2px 0" }}><strong>{tier.label} Price Each:</strong> {money(tier.priceEach)}</p>
            ))}
          </div>
        ))}
        {isAdminView && <p>Profit: <strong>{money(summaryCalc.profit)}</strong></p>}
        <hr style={{ borderColor: activeTheme?.divider }} />
        <p>Product: {hasProductSelected ? (isDtf ? "DTF Transfers" : isScreenPrint ? "Screen Printing" : isEmbroidery ? "Embroidery" : calc.label) : "Select a product"}</p>
        {!isDtf && !isScreenPrint && !isEmbroidery && isAdminView && <p>Total Sq Ft: {calc.totalSqFt?.toFixed(2)}</p>}

        {isAdminView && <button className="modeBtn" style={{ marginBottom: 10 }} onClick={() => setShowBreakdown((v) => !v)}>{showBreakdown ? "Hide" : "Show"} Detailed Breakdown</button>}

        {!isDtf && !isEmbroidery && showBreakdown && calc.actualTotalSqFt !== undefined && <p>Actual Sq Ft: {calc.actualTotalSqFt.toFixed(2)}</p>}
        {!isDtf && !isEmbroidery && showBreakdown && calc.effectiveSqFtEach !== undefined && <p>Effective Sq Ft Each: {showBreakdown && calc.effectiveSqFtEach.toFixed(2)}</p>}
        {!isDtf && !isEmbroidery && showBreakdown && calc.billableSqFtEach !== undefined && <p>Billable Sq Ft Each: {showBreakdown && calc.billableSqFtEach.toFixed(2)}</p>}
        {!isDtf && showBreakdown && calc.layoutWidth !== undefined && calc.layoutHeight !== undefined && (
          <p>Layout Size: {showBreakdown && calc.layoutWidth}" x {calc.layoutHeight}"</p>
        )}
        {!isDtf && showBreakdown && calc.rawBillableSqFt !== undefined && <p>Raw Gang Sq Ft: {showBreakdown && calc.rawBillableSqFt.toFixed(2)}</p>}
        {!isDtf && showBreakdown && calc.billingMode !== undefined && <p>Billing Mode: {showBreakdown && calc.billingMode}</p>}
        {!isDtf && showBreakdown && calc.normalSqFt !== undefined && <p>Normal Layout Sq Ft: {showBreakdown && calc.normalSqFt.toFixed(2)}</p>}
        {!isDtf && calc.rotatedSqFt !== undefined && <p>Rotated Layout Sq Ft: {calc.rotatedSqFt.toFixed(2)}</p>}

        {!isEmbroidery && showBreakdown && calc.tierPrice !== undefined && <p>Tier Price Total: {money(calc.tierPrice)}</p>}
        {!isEmbroidery && showBreakdown && calc.costMarginPrice !== undefined && <p>Cost + Margin Price: {money(calc.costMarginPrice)}</p>}
        {showBreakdown && activeProduct === "carbonless" && calc.retailMultiplier !== undefined && <p>Retail Multiplier: {calc.retailMultiplier.toFixed(2)}x</p>}
        {showBreakdown && calc.shopPrice !== undefined && <p>Shop Sq Ft Price: {money(calc.shopPrice)}</p>}
        {!isEmbroidery && showBreakdown && calc.sheetsUsed !== undefined && <p>Sheets Used: {showBreakdown && calc.sheetsUsed.toFixed(2)}</p>}
        {!isEmbroidery && showBreakdown && calc.sheetsRounded !== undefined && <p>Sheets Rounded: {showBreakdown && calc.sheetsRounded}</p>}
        {!isEmbroidery && showBreakdown && calc.piecesPerSheet !== undefined && <p>Pieces Per Sheet: {showBreakdown && calc.piecesPerSheet}</p>}
        {!isEmbroidery && showBreakdown && calc.sheetLayout !== undefined && <p>Sheet Layout: {showBreakdown && calc.sheetLayout}</p>}
        {showBreakdown && calc.costPerPiece !== undefined && <p>Cost Per Piece: {money(calc.costPerPiece)}</p>}
        {isAdminView && !isEmbroidery && <p>Material Cost: {money(summaryCalc.materialCost)}</p>}
        {calc.standOffQty !== undefined && calc.standOffQty > 0 && (
          <>
            <p>Stand-Off Qty: {calc.standOffQty} ({calc.standOffColor})</p>
            <p>Stand-Off Direct Cost: {money(calc.standOffDirectCost)}</p>
            <p>Stand-Off Retail Charge: {money(calc.standOffRetailCharge)}</p>
          </>
        )}
        {isAdminView && <p>Shipping: {money(summaryCalc.shipping)}</p>}
        {isAdminView && <p>Direct Cost: {money(summaryCalc.cost)}</p>}
        {isAdminView && <p>Actual Margin: {Number(summaryCalc.margin || 0).toFixed(1)}%</p>}
        {isAdminView && !isEmbroidery && <p>Multiplier: {num(multiplier, 1)}x</p>}
        {isAdminView && isDtf && (
          <>
            {showBreakdown && (
              <>
                <hr style={{ borderColor: activeTheme?.divider }} />
                <p><strong>DTF Profit Breakdown</strong></p>
                <p><strong>Apparel Profit:</strong> {money((dtfData.apparelRetailSubtotal || 0) - (dtfData.apparelDirectCost || 0))}</p>
                <p><strong>DTF Material Profit:</strong> {money((dtfData.dtfRetailSubtotal || 0) - (dtfData.dtfMaterialCost || 0))}</p>
                <p><strong>Sleeve Add-On Retail:</strong> {money(dtfData.sleeveRetailAddOnTotal || 0)}</p>
                <p><strong>Sleeve Add-On Profit:</strong> {money(dtfData.sleeveRetailAddOnTotal || 0)}</p>
                <p><strong>Total Profit:</strong> {money(summaryCalc.profit)}</p>
              </>
            )}
            <hr style={{ borderColor: activeTheme?.divider }} />
            <p><strong>Apparel Direct:</strong> {money(dtfData.apparelDirectCost || 0)}</p>
            <p><strong>Apparel Retail Subtotal:</strong> {money(dtfData.apparelRetailSubtotal || 0)}</p>
            <p><strong>DTF Material Cost:</strong> {money(dtfData.dtfMaterialCost || 0)}</p>
            <p><strong>DTF Retail Subtotal:</strong> {money(dtfData.dtfRetailSubtotal || 0)}</p>
            <p><strong>Size Upcharges:</strong> {money(dtfData.sizeUpchargeTotal || 0)}</p>
            <p><strong>Sleeve Retail Add-On:</strong> {money(dtfData.sleeveRetailAddOnTotal || 0)}</p>
            <p><strong>Roll Length Used:</strong> {Number(dtfData.rollLengthUsed || 0).toFixed(2)}"</p>
            <p><strong>Transfer Count:</strong> {dtfData.transferCount || 0}</p>
          </>
        )}

        {!isDtf && !isScreenPrint && !isEmbroidery && <ProductVisual product={activeProduct || product} comingSoon={!activeProduct} />}
        {!isDtf && (["vinyl", "reflective", "footprints"].includes(activeProduct)) && <VinylLayoutPreview calc={calc} />}
        {!isDtf && (activeProduct === "foamcore" || activeProduct === "pvc" || activeProduct === "polystyrene" || product === "coroSigns") && <SheetLayoutPreview calc={calc} title={product === "coroSigns" ? "Custom Cut Coro Sheet Layout" : "Sheet Layout Preview"} />}
        {isDtf ? (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.08)", color: "#e5e7eb", fontSize: 14, lineHeight: 1.35 }}>
            <h3 style={{ marginTop: 0 }}>{isAdminView ? "Selected Details" : "DTF Customer Quote"}</h3>
            <p><strong>Product:</strong> {dtfData.dtfMode === "dtfOnly" ? "DTF Transfers Only" : "DTF Transfers"}</p>
            {dtfData.dtfMode !== "dtfOnly" && <p><strong>Style #:</strong> {dtfData.selectedStyle || "Not selected"}</p>}
            {dtfData.dtfMode !== "dtfOnly" && <p><strong>Garment:</strong> {dtfData.selectedTitle || "Not selected"}</p>}
            {dtfData.dtfMode !== "dtfOnly" && <p><strong>Color:</strong> {dtfData.selectedColor || "Not selected"}</p>}
            {dtfData.dtfMode === "dtfOnly" && <p><strong>Transfer Size:</strong> {dtfData.dtfOnlyWidth || 0}" x {dtfData.dtfOnlyHeight || 0}"</p>}
            <p><strong>{dtfData.dtfMode === "dtfOnly" ? "DTF Quantity" : "Total Garments"}:</strong> {dtfData.totalGarmentQty || 0}</p>
            {dtfData.dtfMode !== "dtfOnly" && <p><strong>Sizes:</strong> {Object.entries(dtfData.sizeQuantities || {}).filter(([, v]) => Number(v) > 0).map(([k, v]) => `${k}(${v})`).join(", ") || "None"}</p>}
            {dtfData.dtfMode !== "dtfOnly" && <p><strong>Print Locations:</strong> {(dtfData.selectedPrintLocations || []).length ? dtfData.selectedPrintLocations.join(", ") : "None selected"}</p>}
            {dtfData.bringYourOwnApparel && !isAdminView && <p><strong>Bring your own apparel selected.</strong> Bring your own apparel option available. Please call for details.</p>}
            {(dtfData.sizePriceBreakdown || []).length ? (
              <p><strong>Price breakdown:</strong> {formatSizePriceBreakdown(dtfData.sizePriceBreakdown).join(" • ")}</p>
            ) : (
              <p><strong>Price per garment:</strong> {money(dtfData.each || 0)}</p>
            )}
            <p><strong>Final total:</strong> {money(dtfData.retail || 0)}</p>
            {isAdminView && <p><strong>SanMar Item:</strong> {dtfData.productDisplay || "Not selected"}</p>}
            {isAdminView && <p><strong>Apparel Cost Used:</strong> {money(dtfData.apparelCostUsed || 0)}</p>}
            {isAdminView && <p><strong>Roll Length Used:</strong> {Number(dtfData.rollLengthUsed || 0).toFixed(2)}"</p>}
            {isAdminView && <p><strong>Transfer Count:</strong> {dtfData.transferCount || 0}</p>}
            {isAdminView && <p><strong>Size Upcharges:</strong> {money(dtfData.sizeUpchargeTotal || 0)}</p>}
          </div>
        ) : (isScreenPrint || isEmbroidery) ? (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.08)", color: "#e5e7eb", fontSize: 14, lineHeight: 1.35 }}>
            <h3 style={{ marginTop: 0 }}>{isEmbroidery ? "Embroidery Details" : "Screen Printing Details"}</h3>
            <p><strong>Product:</strong> {isEmbroidery ? "Embroidery" : "Screen Printing"}</p>
            {(dtfSummary.lineItems || []).map((li, idx) => (
              <div key={`${li.id}-${idx}`} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid rgba(148,163,184,0.35)" }}>
                <p><strong>Line {idx + 1}:</strong> {li.style} — {li.title || ""}</p>
                <p><strong>Color:</strong> {li.color || "Not selected"}</p>
                <p><strong>Sizes:</strong> {Object.entries(li.sizeQty || {}).filter(([,v]) => Number(v) > 0).map(([k,v]) => `${k}:${v}`).join(", ") || "None"}</p>
                <p><strong>Total Qty:</strong> {li.totalQty}</p>
                {isAdminView && !isEmbroidery && <p><strong>CASE_PRICE (avg):</strong> {money(li.casePrice || 0)}</p>}
                {isAdminView && <p><strong>Final Retail Subtotal:</strong> {money(li.finalRetailSubtotal || 0)}</p>}
                {(li.sizePriceBreakdown || []).length ? (
                  <p><strong>Price breakdown:</strong> {(li.sizePriceBreakdown || []).map((tier) => `${tier.label || tier.size}: ${tier.qty} @ ${money(tier.priceEach || tier.garmentPriceEach || 0)}`).join(" • ")}</p>
                ) : (
                  <p><strong>Final Retail Per Shirt:</strong> {money(li.retailPerShirt || 0)}</p>
                )}
              </div>
            ))}
            <p><strong>Total Garments:</strong> {dtfSummary.totalGarments}</p>
            {!isEmbroidery && (dtfSummary.printLines || []).map((pl, idx) => (
              <p key={`${pl.id}-${idx}`}><strong>{pl.name}:</strong> {pl.colors} colors{isAdminView ? ` • ${pl.pricingType} • ${money(pl.pricePerPrint)}/print • ${money(pl.subtotal)}` : ""}</p>
            ))}
            {isEmbroidery && <p><strong>Stitch Count:</strong> {dtfSummary.stitchCount}</p>}
            {isEmbroidery && <p><strong>Stitch Tier Used:</strong> {dtfSummary.stitchTierUsed}</p>}
            {isEmbroidery && <p><strong>Placement:</strong> {(dtfSummary.placements || []).join(", ")}</p>}
            {isEmbroidery && <p><strong>Thread Colors:</strong> {dtfSummary.threadColors}</p>}
            {isEmbroidery && Number(dtfSummary.digitizingFees || 0) > 0 && <p><strong>Digitizing Fee(s):</strong> {money(dtfSummary.digitizingFees)}</p>}
            {isAdminView && isEmbroidery && <p><strong>Garment Direct Cost:</strong> {money(dtfSummary.apparelDirectCost || 0)}</p>}
            {isAdminView && isEmbroidery && <p><strong>Garment Retail Subtotal:</strong> {money(dtfSummary.apparelRetailSubtotal || 0)}</p>}
            {isAdminView && isEmbroidery && <p><strong>Embroidery Direct / item:</strong> {money(dtfSummary.embroideryEachDirect || 0)}</p>}
            {isAdminView && isEmbroidery && <p style={{ fontWeight: 800, padding: "8px 10px", borderLeft: "4px solid #f59e0b", background: "rgba(245,158,11,0.15)", borderRadius: 6 }}><strong>OUTSOURCED EMBROIDERY COST (Embroidery Direct Total):</strong> {money(dtfSummary.embroideryDirectTotal || 0)}</p>}
            {isAdminView && isEmbroidery && <p><strong>Embroidery Retail / item:</strong> {money(dtfSummary.embroideryRetailEach || 0)}</p>}
            {isAdminView && isEmbroidery && <p><strong>Embroidery Retail Subtotal:</strong> {money(dtfSummary.embroideryRetailSubtotal || dtfSummary.embroiderySubtotal || 0)}</p>}
            {isAdminView && isEmbroidery && <p><strong>Handling Allowance:</strong> {money(dtfSummary.handlingDirect || 0)} direct</p>}
            {isAdminView && isEmbroidery && <p><strong>Total Direct Cost:</strong> {money(dtfSummary.cost || 0)}</p>}
            {isAdminView && isEmbroidery && <p><strong>Normal Calculated Retail:</strong> {money(dtfSummary.calculatedRetail || dtfSummary.retail || 0)}</p>}
            {isAdminView && isEmbroidery && dtfSummary.targetRetailPricePerItem && <p><strong>Target Retail Price Per Item:</strong> {money(dtfSummary.targetRetailPricePerItem)}</p>}
            {isAdminView && isEmbroidery && dtfSummary.targetRetailPricePerItem && <p><strong>Target Retail Total:</strong> {money(dtfSummary.targetRetailTotal || 0)}</p>}
            {isAdminView && isEmbroidery && dtfSummary.targetRetailPricePerItem && <p><strong>Difference from calculated retail:</strong> {money(dtfSummary.targetRetailDelta || 0)}</p>}
            {isAdminView && isEmbroidery && dtfSummary.targetRetailPricePerItem && <p><strong>Profit at Target:</strong> {money((dtfSummary.targetRetailTotal || 0) - (dtfSummary.cost || 0))}</p>}
            {isAdminView && isEmbroidery && dtfSummary.targetRetailPricePerItem && <p><strong>Margin at Target:</strong> {((((((dtfSummary.targetRetailTotal || 0) - (dtfSummary.cost || 0)) / (dtfSummary.targetRetailTotal || 1)) * 100) || 0)).toFixed(1)}%</p>}
            {isAdminView && isEmbroidery && dtfSummary.targetRetailPricePerItem && <p><strong>Target Price Per Item:</strong> {money(dtfSummary.targetRetailPricePerItem || 0)}</p>}
            {isAdminView && isEmbroidery && dtfSummary.targetRetailPricePerItem && ((dtfSummary.targetRetailTotal || 0) <= (dtfSummary.cost || 0) ? <p style={{ color: "#ef4444", fontWeight: 700 }}>Warning: Target price is at or below direct cost (loss).</p> : null)}
            <p><strong>Final Retail:</strong> {money(dtfSummary.retail)}</p>
            {isAdminView && isEmbroidery && <p><strong>Actual Margin:</strong> {Number(dtfSummary.margin || 0).toFixed(1)}%</p>}
            {isEmbroidery ? <p><strong>Average Retail Per Item:</strong> {money(dtfSummary.each || 0)}</p> : (((dtfSummary.lineItems || []).length <= 1) && <p><strong>Average price per item:</strong> {money(dtfSummary.averagePricePerShirt || dtfSummary.each)}</p>)}
            {isAdminView && <p><strong>Profit:</strong> {money(dtfSummary.profit)}</p>}
          </div>
        ) : <SelectedDetails details={selectedDetails} />}
      </aside>

      <div className="mobilePrice" role="button" tabIndex={0} onClick={scrollToQuoteSummary} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && scrollToQuoteSummary()} style={{ cursor: "pointer", borderColor: activeTheme?.summaryBorder, boxShadow: `0 10px 20px ${activeTheme?.accentGlow || "rgba(0,0,0,.35)"}`, background: `linear-gradient(160deg, rgba(11,23,56,.92), rgba(15,23,42,.95)), ${activeTheme?.mobileTint || "rgba(56,189,248,.1)"}` }}>
        <div className="mobilePriceTop"><strong>{hasProductSelected ? `Suggested Retail ${money(summaryCalc.retail).replace("$", "$ ")}` : "Select item to add to quote"}</strong></div>
        {!hasProductSelected ? (
          <div className="mobileOptions">Total: {money(0)}</div>
        ) : isDtf ? (
          <>
            <div className="mobileMeta">
              DTF Transfers • {dtfData.totalGarmentQty || 0} garments
              {dtfData.productDisplay ? ` • ${dtfData.productDisplay}` : ""}
            </div>
            <div className="mobileOptions">
              {(dtfData.selectedPrintLocations || []).length ? dtfData.selectedPrintLocations.join(" • ") : "No print locations selected"}
              {dtfData.each ? ` • ${money(dtfData.each)}/garment` : ""}
              {` • Total: ${money(dtfData.retail || 0)}`}
            </div>
          </>
        ) : (isScreenPrint || isEmbroidery) ? (
          <>
            <div className="mobileMeta">{isEmbroidery ? `Embroidery • ${dtfSummary.totalGarments || 0} garments • ${(dtfSummary.lineItems || []).filter((li) => li.totalQty > 0).length} style(s)` : `Screen Printing • ${dtfSummary.totalGarments || 0} garments • ${(dtfSummary.lineItems || []).filter((li) => li.totalQty > 0).length} style(s)`}</div>
            <div className="mobileOptions">{isEmbroidery ? `Stitches ${dtfSummary.stitchCount || 0} • ${(dtfSummary.placements || []).join(", ") || "No placement selected"} • Total: ${money(dtfSummary.retail)}` : `${(dtfSummary.printLines || []).length ? (dtfSummary.printLines || []).map((pl) => `${pl.name} ${pl.colors}-color`).join(" • ") : "No print locations selected"} • Total: ${money(dtfSummary.retail)}`}</div>
          </>
        ) : (
          <>
            <div className="mobileMeta">{mobileMeta.line1}</div>
            <div className="mobileOptions">{mobileMeta.line2}</div>
            {mobileMeta.line3 && <div className="mobileOptions">{mobileMeta.line3}</div>}
            {activeProduct === "doorHangers" && <div className="mobileOptions">{`Price Each ${money(summaryCalc.each || 0)} • Total ${money(summaryCalc.retail || 0)}`}</div>}
          </>
        )}
      </div>
    </>
  );
}
