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
}) {
  return (
    <>
      <aside className="summary sticky">
        <h2>Suggested Retail</h2>
        <div style={{ fontSize: 42, fontWeight: "bold" }}>{money(calc.retail)}</div>
        <p>Each: <strong>{money(calc.each)}</strong></p>
        <p>Profit: <strong>{money(calc.profit)}</strong></p>
        <hr />
        <p>Product: {calc.label}</p>
        <p>Total Sq Ft: {calc.totalSqFt?.toFixed(2)}</p>

        <button className="modeBtn" style={{ marginBottom: 10 }} onClick={() => setShowBreakdown((v) => !v)}>{showBreakdown ? "Hide" : "Show"} Detailed Breakdown</button>

        {showBreakdown && calc.actualTotalSqFt !== undefined && <p>Actual Sq Ft: {calc.actualTotalSqFt.toFixed(2)}</p>}
        {showBreakdown && calc.effectiveSqFtEach !== undefined && <p>Effective Sq Ft Each: {showBreakdown && calc.effectiveSqFtEach.toFixed(2)}</p>}
        {showBreakdown && calc.billableSqFtEach !== undefined && <p>Billable Sq Ft Each: {showBreakdown && calc.billableSqFtEach.toFixed(2)}</p>}
        {showBreakdown && calc.layoutWidth !== undefined && calc.layoutHeight !== undefined && (
          <p>Layout Size: {showBreakdown && calc.layoutWidth}" x {calc.layoutHeight}"</p>
        )}
        {showBreakdown && calc.rawBillableSqFt !== undefined && <p>Raw Gang Sq Ft: {showBreakdown && calc.rawBillableSqFt.toFixed(2)}</p>}
        {showBreakdown && calc.billingMode !== undefined && <p>Billing Mode: {showBreakdown && calc.billingMode}</p>}
        {showBreakdown && calc.normalSqFt !== undefined && <p>Normal Layout Sq Ft: {showBreakdown && calc.normalSqFt.toFixed(2)}</p>}
        {calc.rotatedSqFt !== undefined && <p>Rotated Layout Sq Ft: {calc.rotatedSqFt.toFixed(2)}</p>}

        {showBreakdown && calc.tierPrice !== undefined && <p>Tier Price Total: {money(calc.tierPrice)}</p>}
        {showBreakdown && calc.costMarginPrice !== undefined && <p>Cost + Margin Price: {money(calc.costMarginPrice)}</p>}
        {showBreakdown && calc.shopPrice !== undefined && <p>Shop Sq Ft Price: {money(calc.shopPrice)}</p>}
        {showBreakdown && calc.sheetsUsed !== undefined && <p>Sheets Used: {showBreakdown && calc.sheetsUsed.toFixed(2)}</p>}
        {showBreakdown && calc.sheetsRounded !== undefined && <p>Sheets Rounded: {showBreakdown && calc.sheetsRounded}</p>}
        {showBreakdown && calc.piecesPerSheet !== undefined && <p>Pieces Per Sheet: {showBreakdown && calc.piecesPerSheet}</p>}
        {showBreakdown && calc.sheetLayout !== undefined && <p>Sheet Layout: {showBreakdown && calc.sheetLayout}</p>}
        {showBreakdown && calc.costPerPiece !== undefined && <p>Cost Per Piece: {money(calc.costPerPiece)}</p>}
        <p>Material Cost: {money(calc.materialCost)}</p>
        {calc.standOffQty !== undefined && calc.standOffQty > 0 && (
          <>
            <p>Stand-Off Qty: {calc.standOffQty} ({calc.standOffColor})</p>
            <p>Stand-Off Direct Cost: {money(calc.standOffDirectCost)}</p>
            <p>Stand-Off Retail Charge: {money(calc.standOffRetailCharge)}</p>
          </>
        )}
        <p>Shipping: {money(calc.shipping)}</p>
        <p>Direct Cost: {money(calc.cost)}</p>
        <p>Actual Margin: {calc.margin.toFixed(1)}%</p>
        <p>Multiplier: {num(multiplier, 1)}x</p>

        <ProductVisual product={activeProduct || product} comingSoon={!activeProduct} />
        {activeProduct === "vinyl" && <VinylLayoutPreview calc={calc} />}
        {(activeProduct === "foamcore" || activeProduct === "pvc") && <SheetLayoutPreview calc={calc} />}
        <SelectedDetails details={selectedDetails} />
      </aside>

      <div className="mobilePrice">
        <div className="mobilePriceTop"><strong>Suggested Retail {money(calc.retail).replace("$", "$ ")}</strong></div>
        <div className="mobileMeta">{productMap[product]?.label || products[activeProduct]} • {num(width)}&quot; x {num(height)}&quot; • Qty {num(qty, 1)}</div>
        <div className="mobileOptions">{selectedDetails.options.length ? `Options: ${selectedDetails.options.join(", ")}` : "Options: None"}</div>
      </div>
    </>
  );
}
