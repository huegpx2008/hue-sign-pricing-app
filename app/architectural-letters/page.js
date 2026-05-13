"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  architecturalLetterCatalog,
  architecturalLetterDefaults,
  architecturalLetterSteps,
  buildArchitecturalLetterPricingModel,
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
  const pricingModel = useMemo(() => buildArchitecturalLetterPricingModel(form), [form]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const renderStep = () => {
    switch (activeStep.id) {
      case "productType":
        return <Select label="Select Product Type" value={form.productType} options={architecturalLetterCatalog.productTypes} onChange={(value) => update("productType", value)} />;
      case "material":
        return <Select label="Select Material" value={form.material} options={architecturalLetterCatalog.materials} onChange={(value) => update("material", value)} />;
      case "finish":
        return <Select label="Select Finish" value={form.finish} options={architecturalLetterCatalog.finishes} onChange={(value) => update("finish", value)} />;
      case "depth":
        return <Select label="Select Depth / Thickness" value={form.depth} options={architecturalLetterCatalog.depths} onChange={(value) => update("depth", value)} />;
      case "mounting":
        return <Select label="Select Mounting" value={form.mounting} options={architecturalLetterCatalog.mounting} onChange={(value) => update("mounting", value)} />;
      case "lighting":
        return <Select label="Select Lighting" value={form.lighting} options={architecturalLetterCatalog.lighting} onChange={(value) => update("lighting", value)} />;
      case "letterSize":
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
            <NumberField label="Character Count" value={form.characterCount} onChange={(value) => update("characterCount", value)} />
          </div>
        );
      case "shipping":
        return (
          <div style={{ display: "grid", gap: 12 }}>
            <Select label="Shipping Method" value={form.shippingMethod} options={architecturalLetterCatalog.shippingMethods} onChange={(value) => update("shippingMethod", value)} />
            <label>
              Ship To ZIP
              <input style={fieldStyle} value={form.shippingZip} onChange={(e) => update("shippingZip", e.target.value)} placeholder="Optional in Phase 1" />
            </label>
          </div>
        );
      default:
        return <QuoteSummary form={form} pricingModel={pricingModel} isAdminView={isAdminView} />;
    }
  };

  return (
    <main style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", Verdana, sans-serif', minHeight: "100vh", padding: 20, background: "linear-gradient(160deg,#eff6ff,#f8fafc 45%,#fff)", color: "#0f172a" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 16, color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>← Back to main pricing app</Link>
        <section style={{ background: "rgba(255,255,255,.95)", borderRadius: 16, borderTop: "1px solid rgba(30,64,175,.18)", boxShadow: "0 10px 30px rgba(15,23,42,.09)", padding: 20 }}>
          <h1 style={{ marginTop: 0, marginBottom: 6 }}>Architectural Letters</h1>
          <p style={{ marginTop: 0, color: "#475569" }}>Phase 1: Product flow, data model, and pricing architecture placeholders.</p>

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
        </section>
      </div>
    </main>
  );
}

function Select({ label, value, options, onChange }) {
  return <label>{label}<select style={fieldStyle} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function NumberField({ label, value, onChange }) {
  return <label>{label}<input type="number" min={1} style={fieldStyle} value={value} onChange={(e) => onChange(Number(e.target.value) || 1)} /></label>;
}

function QuoteSummary({ form, pricingModel, isAdminView }) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Quote Summary</h3>
      <p style={{ marginTop: 0, color: "#64748b" }}>Final pricing logic will be connected in Phase 2 from spreadsheet, wholesale, and freight tables.</p>
      <pre style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, overflowX: "auto" }}>{JSON.stringify(form, null, 2)}</pre>
      {isAdminView ? (
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
          {Object.keys(pricingModel).filter((k) => k !== "source" && k !== "inputSnapshot").map((key) => (
            <div key={key} style={{ border: "1px dashed #94a3b8", borderRadius: 8, padding: 10, background: "#fff" }}><strong>{key}</strong><div>Pending</div></div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 12, border: "1px dashed #94a3b8", borderRadius: 8, padding: 10, background: "#fff" }}>
          <strong>Suggested Retail Pricing</strong>
          <div>Will display after Phase 2 pricing integration.</div>
        </div>
      )}
    </div>
  );
}
