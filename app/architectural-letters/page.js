"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  architecturalLetterCatalog,
  architecturalLetterDefaults,
  architecturalLetterSteps,
  buildArchitecturalLetterPricingModel,
  computeArchitecturalLetterMetrics,
} from "../../data/architecturalLettersConfig";

const fieldStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" };

export default function ArchitecturalLettersPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState("customer-online");
  const [form, setForm] = useState(architecturalLetterDefaults);

  useEffect(() => {
    const savedMode = typeof window !== "undefined" ? localStorage.getItem("hue-staff-mode") : null;
    if (savedMode) setMode(savedMode);
  }, []);

  const isAdminView = mode === "admin" || mode === "customer-in-store";
  const activeStep = architecturalLetterSteps[stepIndex];
  const metrics = useMemo(() => computeArchitecturalLetterMetrics(form), [form]);
  const pricingModel = useMemo(() => buildArchitecturalLetterPricingModel(form, metrics), [form, metrics]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const renderStep = () => {
    switch (activeStep.id) {
      case "productType":
        return <Select label="Select Product Type" value={form.productType} options={architecturalLetterCatalog.productTypes} onChange={(value) => update("productType", value)} />;
      case "material":
        return <Select label="Select Material" value={form.material} options={architecturalLetterCatalog.materials} onChange={(value) => update("material", value)} />;
      case "finish":
        return <Select label="Select Finish" value={form.finish} options={architecturalLetterCatalog.finishes} onChange={(value) => update("finish", value)} />;
      case "thickness":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Select Thickness" value={form.thickness} options={architecturalLetterCatalog.thickness} onChange={(value) => update("thickness", value)} />
            <Select label="Select Return Depth" value={form.returnDepth} options={architecturalLetterCatalog.returnDepth} onChange={(value) => update("returnDepth", value)} />
          </div>
        );
      case "mounting":
        return <Select label="Select Mounting" value={form.mounting} options={architecturalLetterCatalog.mounting} onChange={(value) => update("mounting", value)} />;
      case "lighting":
        return <Select label="Select Lighting" value={form.lighting} options={architecturalLetterCatalog.lighting} onChange={(value) => update("lighting", value)} />;
      case "letterHeight":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <NumberField label="Letter Height (in)" value={form.letterHeight} onChange={(value) => update("letterHeight", value)} />
            <NumberField label="Letter Width (in)" value={form.letterWidth} onChange={(value) => update("letterWidth", value)} />
          </div>
        );
      case "characterCount":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <NumberField label="Quantity" value={form.quantity} onChange={(value) => update("quantity", value)} />
            <label>Line 1<input style={fieldStyle} value={form.line1} onChange={(e) => update("line1", e.target.value)} /></label>
            <label>Line 2<input style={fieldStyle} value={form.line2} onChange={(e) => update("line2", e.target.value)} /></label>
            <label>Line 3<input style={fieldStyle} value={form.line3} onChange={(e) => update("line3", e.target.value)} /></label>
            <Select label="Preview Alignment" value={form.previewAlignment} options={["left", "center", "right"]} onChange={(value) => update("previewAlignment", value)} />
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={form.excludeSpacesFromBilling} onChange={(e) => update("excludeSpacesFromBilling", e.target.checked)} />Exclude spaces from billable characters</label>
            <NumberField label="Admin Billable Character Override" value={form.characterCountOverride} min={0} onChange={(value) => update("characterCountOverride", value)} />
            <MatchCell label="Letters" value={String(metrics.letters)} />
            <MatchCell label="Spaces" value={String(metrics.spaces)} />
            <MatchCell label="Punctuation" value={String(metrics.punctuation)} />
            <MatchCell label="Numbers" value={String(metrics.numbers)} />
            <MatchCell label="Total Characters" value={String(metrics.totalCharacters)} />
            <MatchCell label="Billable Characters" value={String(metrics.billableCharacters)} />
            <LetterPreview lines={metrics.lines} alignment={form.previewAlignment} />
          </div>
        );
      case "freight":
        return (
          <div style={{ display: "grid", gap: 12 }}>
            <Select label="Shipping Method" value={form.shippingMethod} options={architecturalLetterCatalog.shippingMethods} onChange={(value) => update("shippingMethod", value)} />
            <Select label="Freight Category" value={form.freightCategory} options={architecturalLetterCatalog.freightCategories} onChange={(value) => update("freightCategory", value)} />
            <NumberField label="Sets" value={form.sets} onChange={(value) => update("sets", value)} />
            <NumberField label="Estimated Freight ($)" value={form.freight} min={0} onChange={(value) => update("freight", value)} />
            <NumberField label="Oversized Freight ($)" value={form.oversizedFreight} min={0} onChange={(value) => update("oversizedFreight", value)} />
            <NumberField label="Crate Fee ($)" value={form.crateFee} min={0} onChange={(value) => update("crateFee", value)} />
            <NumberField label="Pallet Fee ($)" value={form.palletFee} min={0} onChange={(value) => update("palletFee", value)} />
            <NumberField label="Adjustment / Discount ($)" value={form.adjustment} min={-999999} onChange={(value) => update("adjustment", value)} />
            <NumberField label="Markup Multiplier (optional test)" value={form.markupMultiplier} min={0} step={0.01} onChange={(value) => update("markupMultiplier", value)} />
            <label>
              Ship To ZIP
              <input style={fieldStyle} value={form.shippingZip} onChange={(e) => update("shippingZip", e.target.value)} placeholder="Optional in Phase 4" />
            </label>
          </div>
        );
      default:
        return <QuoteSummary form={form} metrics={metrics} pricingModel={pricingModel} isAdminView={isAdminView} mode={mode} />;
    }
  };

  return (
    <main style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", Verdana, sans-serif', minHeight: "100vh", padding: 20, background: "linear-gradient(160deg,#eff6ff,#f8fafc 45%,#fff)", color: "#0f172a" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 16, color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>← Back to main pricing app</Link>
        <section style={{ background: "rgba(255,255,255,.95)", borderRadius: 16, borderTop: "1px solid rgba(30,64,175,.18)", boxShadow: "0 10px 30px rgba(15,23,42,.09)", padding: 20 }}>
          <h1 style={{ marginTop: 0, marginBottom: 6 }}>Architectural Letters</h1>
          <p style={{ marginTop: 0, color: "#475569" }}>Phase 4: Admin quote calculation using parsed spreadsheet pricing matches.</p>


          {!isAdminView ? (
            <div style={{ marginTop: 16, border: "1px dashed #94a3b8", borderRadius: 10, padding: 16, background: "#fff" }}>
              <strong>Coming Soon</strong>
              <div>Architectural Letters customer quoting remains locked while pricing validation is in progress.</div>
            </div>
          ) : (
          <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginTop: 16, marginBottom: 18 }}>
            {architecturalLetterSteps.map((step, idx) => (
              <button key={step.id} onClick={() => setStepIndex(idx)} style={{ padding: "10px 8px", borderRadius: 8, border: idx === stepIndex ? "2px solid #1d4ed8" : "1px solid #cbd5e1", background: idx === stepIndex ? "#dbeafe" : "#fff", fontWeight: 700 }}>
                {idx + 1}. {step.title}
              </button>
            ))}
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, background: "#f8fafc" }}>{renderStep()}</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button onClick={() => setStepIndex((s) => Math.max(0, s - 1))} disabled={stepIndex === 0}>Back</button>
            <button onClick={() => setStepIndex((s) => Math.min(architecturalLetterSteps.length - 1, s + 1))} disabled={stepIndex === architecturalLetterSteps.length - 1}>Next</button>
          </div>

          </>
          )}        </section>
      </div>
    </main>
  );
}

function Select({ label, value, options, onChange }) {
  return <label>{label}<select style={fieldStyle} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function NumberField({ label, value, onChange, min = 1, step = 1 }) {
  return <label>{label}<input type="number" min={min} step={step} style={fieldStyle} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} /></label>;
}

function QuoteSummary({ form, metrics, pricingModel, isAdminView, mode }) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Quote Summary</h3>
      <p style={{ marginTop: 0, color: "#64748b" }}>Spreadsheet matched price is currently treated as retail/base unit price for admin-only testing.</p>
      <pre style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, overflowX: "auto" }}>{JSON.stringify(form, null, 2)}</pre>
      {isAdminView ? (
        <>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
          {Object.keys(pricingModel).filter((k) => k !== "source" && k !== "inputSnapshot").map((key) => (
            <div key={key} style={{ border: "1px dashed #94a3b8", borderRadius: 8, padding: 10, background: "#fff" }}><strong>{key}</strong><div>Pending</div></div>
          ))}
        </div>
        <AdminDebugPanel form={form} metrics={metrics} mode={mode} />
        </>
      ) : (
        <div style={{ marginTop: 12, border: "1px dashed #94a3b8", borderRadius: 8, padding: 10, background: "#fff" }}>
          <strong>Suggested Retail Pricing</strong>
          <div>Will display after Phase 2 pricing integration.</div>
        </div>
      )}
    </div>
  );
}


function AdminDebugPanel({ form, metrics, mode }) {
  const [debug, setDebug] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/admin/architectural-letters/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input: form }),
      });
      if (response.ok) setDebug(await response.json());
    };
    load();
  }, [form, mode]);

  const quantity = Number(form.quantity) || 0;
  const characterCount = Number(metrics.billableCharacters) || 0;
  const sets = Number(form.sets) || 0;
  const freight = (Number(form.freight) || 0) + (Number(form.oversizedFreight) || 0) + (Number(form.crateFee) || 0) + (Number(form.palletFee) || 0);
  const adjustment = Number(form.adjustment) || 0;
  const markupMultiplier = Number(form.markupMultiplier) || 1;
  const sourcePrice = debug?.bestMatch?.numericPrice ?? null;
  const effectiveSets = sets > 0 ? sets : 1;
  const billableCharacters = quantity * characterCount * effectiveSets;
  const subtotal = sourcePrice != null ? sourcePrice * billableCharacters : 0;
  const adjustedSubtotal = subtotal + adjustment;
  const estimatedRetail = adjustedSubtotal * markupMultiplier + freight;

  const requiredFields = ["productType", "material", "finish", "thickness", "mounting", "lighting", "letterHeight"];
  const missingSelections = requiredFields.filter((key) => !form[key]);
  const warnings = [];
  if (!debug?.bestMatch) warnings.push("No pricing match found.");
  if (missingSelections.length) warnings.push(`Missing required selections: ${missingSelections.join(", ")}.`);
  if (debug?.bestMatch && sourcePrice == null) warnings.push("Pricing value unavailable for the matched catalog row.");
  if (debug?.bestMatch?.matchConfidence === "uncertain") warnings.push("Catalog/spreadsheet match uncertain. Validate this selection manually.");

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
      {warnings.length > 0 && (
        <div style={{ background: "#fff7ed", borderRadius: 8, border: "1px solid #fdba74", padding: 12 }}>
          <h4 style={{ marginTop: 0, marginBottom: 8 }}>Warnings</h4>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 12 }}>
        <h4 style={{ marginTop: 0, marginBottom: 8 }}>Admin Quote Summary</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          <MatchCell label="Product type" value={form.productType} />
          <MatchCell label="Material" value={form.material} />
          <MatchCell label="Finish" value={form.finish} />
          <MatchCell label="Thickness/depth" value={`${form.thickness} / ${form.returnDepth}`} />
          <MatchCell label="Letter height" value={`${form.letterHeight} in`} />
          <MatchCell label="Mounting" value={form.mounting} />
          <MatchCell label="Lighting" value={form.lighting} />
          <MatchCell label="Quantity" value={String(quantity)} />
          <MatchCell label="Lines" value={metrics.lines.filter(Boolean).join(" | ") || "—"} />
          <MatchCell label="Total chars / Billable chars" value={`${metrics.totalCharacters} / ${characterCount}`} />
          <MatchCell label="Sets" value={String(effectiveSets)} />
          <MatchCell label="Lighting Type" value={form.lighting} />
          <MatchCell label="Return Depth" value={form.returnDepth} />
          <MatchCell label="Spreadsheet matched unit price" value={sourcePrice != null ? `$${sourcePrice.toFixed(2)}` : "—"} />
          <MatchCell label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <MatchCell label="Estimated freight total" value={`$${freight.toFixed(2)}`} />
          <MatchCell label="Adjustments" value={`$${adjustment.toFixed(2)}`} />
          <MatchCell label="Markup/multiplier" value={markupMultiplier.toFixed(2)} />
          <MatchCell label="Final estimated retail" value={`$${estimatedRetail.toFixed(2)}`} />
        </div>
      </div>

      <details style={{ background: "#fff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 10 }}>
        <summary style={{ fontWeight: 700, cursor: "pointer" }}>Admin Pricing Debug (Spreadsheet Source)</summary>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          <MatchCell label="source sheet/tab" value={debug?.bestMatch?.sourceSheetName} />
          <MatchCell label="source row" value={debug?.bestMatch?.sourceRow ? String(debug.bestMatch.sourceRow) : "—"} />
          <MatchCell label="matched fields" value={debug?.bestMatch?.matchedFieldsSummary || "—"} />
        </div>
        <pre style={{ fontSize: 12, maxHeight: 360, overflow: "auto" }}>{JSON.stringify(debug, null, 2)}</pre>
      </details>
    </div>
  );
}

function LetterPreview({ lines, alignment }) {
  const justify = alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start";
  return (
    <div style={{ gridColumn: "1 / -1", border: "1px dashed #94a3b8", borderRadius: 8, background: "#fff", padding: 12 }}>
      <strong>Letter Preview</strong>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: justify, gap: 6, minHeight: 90 }}>
        {lines.map((line, idx) => <div key={`${idx}-${line}`} style={{ letterSpacing: "0.08em", minHeight: 20 }}>{line || "‎"}</div>)}
      </div>
    </div>
  );
}

function MatchCell({ label, value }) {
  return <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}><div style={{ fontSize: 12, color: "#64748b" }}>{label}</div><div style={{ fontWeight: 700 }}>{value || "—"}</div></div>;
}
