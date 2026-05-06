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
}) {
  const isDtf = activeProduct === "dtfTransfers" && dtfSummary;
  const isScreenPrint = activeProduct === "screenPrinting" && dtfSummary;
  const summaryCalc = (isDtf || isScreenPrint) ? dtfSummary : calc;

  return (
    <>
      <aside className="summary sticky">
        <h2>Suggested Retail</h2>
        <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(summaryCalc.retail)}</div>
        {!(isScreenPrint && (dtfSummary.lineItems || []).length > 1) && <p>Each: <strong>{money(summaryCalc.each)}</strong></p>}
        <p>Profit: <strong>{money(summaryCalc.profit)}</strong></p>
        <hr />
        <p>Product: {isDtf ? "DTF Transfers" : isScreenPrint ? "Screen Printing" : calc.label}</p>
        {!isDtf && !isScreenPrint && <p>Total Sq Ft: {calc.totalSqFt?.toFixed(2)}</p>}

        <button className="modeBtn" style={{ marginBottom: 10 }} onClick={() => setShowBreakdown((v) => !v)}>{showBreakdown ? "Hide" : "Show"} Detailed Breakdown</button>

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
        <p>Material Cost: {money(summaryCalc.materialCost)}</p>
        {calc.standOffQty !== undefined && calc.standOffQty > 0 && (
          <>
            <p>Stand-Off Qty: {calc.standOffQty} ({calc.standOffColor})</p>
            <p>Stand-Off Direct Cost: {money(calc.standOffDirectCost)}</p>
            <p>Stand-Off Retail Charge: {money(calc.standOffRetailCharge)}</p>
          </>
        )}
        <p>Shipping: {money(summaryCalc.shipping)}</p>
        <p>Direct Cost: {money(summaryCalc.cost)}</p>
        <p>Actual Margin: {summaryCalc.margin.toFixed(1)}%</p>
        <p>Multiplier: {num(multiplier, 1)}x</p>
        {isDtf && (
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
        {!isDtf && activeProduct === "vinyl" && <VinylLayoutPreview calc={calc} />}
        {!isDtf && (activeProduct === "foamcore" || activeProduct === "pvc") && <SheetLayoutPreview calc={calc} />}
        {isDtf ? (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.08)", color: "#e5e7eb", fontSize: 14, lineHeight: 1.35 }}>
            <h3 style={{ marginTop: 0 }}>Selected Details</h3>
            <p><strong>Product:</strong> DTF Transfers</p>
            <p><strong>SanMar Item:</strong> {dtfSummary.productDisplay}</p>
            <p><strong>Apparel Cost Used:</strong> {money(dtfSummary.apparelCostUsed)}</p>
            <p><strong>Total Garments:</strong> {dtfSummary.totalGarmentQty}</p>
            <p><strong>Print Locations:</strong> {dtfSummary.selectedPrintLocations.length ? dtfSummary.selectedPrintLocations.join(", ") : "None selected"}</p>
            <p><strong>Roll Length Used:</strong> {dtfSummary.rollLengthUsed.toFixed(2)}"</p>
            <p><strong>Transfer Count:</strong> {dtfSummary.transferCount}</p>
            <p><strong>Size Upcharges:</strong> {money(dtfSummary.sizeUpchargeTotal)}</p>
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
                <p><strong>CASE_PRICE (avg):</strong> {money(li.casePrice || 0)}</p>
                <p><strong>Product Markup %:</strong> {li.productMarkupPercent || dtfSummary.productMarkupPercent}%</p>
                <p><strong>Marked-up Garment Price:</strong> {money(li.markedUpGarmentPrice || 0)} /shirt</p>
                <p><strong>Garment Direct:</strong> {money(li.garmentCost)}</p>
                <p><strong>Garment Retail:</strong> {money(li.garmentRetail)}</p>
                <p><strong>Print Charge Allocation:</strong> {money(li.printChargeAllocated || 0)}</p>
                <p><strong>Setup Fee Allocation:</strong> Separate fee</p>
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
            <p><strong>Apparel Direct Cost:</strong> {money(dtfSummary.apparelDirectCost)}</p>
            <p><strong>Apparel Retail Subtotal:</strong> {money(dtfSummary.apparelRetailSubtotal)}</p>
            <p><strong>Print Charge Subtotal:</strong> {money(dtfSummary.printChargeSubtotal)}</p>
            <p><strong>Direct Cost:</strong> {money(dtfSummary.cost)}</p>
            <p><strong>Final Retail:</strong> {money(dtfSummary.retail)}</p>
            <p><strong>Average price per shirt:</strong> {money(dtfSummary.averagePricePerShirt || dtfSummary.each)}</p>
            <p><strong>Profit:</strong> {money(dtfSummary.profit)}</p>
          </div>
        ) : <SelectedDetails details={selectedDetails} />}
      </aside>

      <div className="mobilePrice">
        <div className="mobilePriceTop"><strong>Suggested Retail {money(summaryCalc.retail).replace("$", "$ ")}</strong></div>
        {isScreenPrint ? (
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
