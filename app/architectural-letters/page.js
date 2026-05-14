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
const optionDescriptions = {
  productType: {
    "Flat Cut Metal": "Thin dimensional metal letters cut from sheet material.",
    "Fabricated Non-Lit": "Deeper dimensional metal letters with formed sides/returns.",
    "Flat Cut Acrylic": "Laser-cut acrylic dimensional letters.",
    "Formed Plastic": "Molded plastic letters with lighter weight construction.",
    "Cast Metal": "Solid cast bronze/aluminum letters for premium durability.",
    "Face Lit": "Illuminated letters with light coming through the face.",
    "Halo Lit": "Illuminated letters with back halo glow onto the wall.",
    "Plaques": "Cast, etched, or signage plaques for donor/directories.",
  },
  mounting: {
    "Stud Mount": "Hidden studs anchor letters off the wall.",
    "Double-Face Tape": "Adhesive tape mount for lightweight applications.",
    "Flush Mount": "Letters sit directly against the mounting surface.",
    Raceway: "Letters pre-mounted to a raceway for easier installation.",
    "Pad Mount": "Raised pads/spacers create stand-off distance.",
  },
  lighting: {
    "Non-Lit": "No illumination; daytime visibility only.",
    "Face-Lit": "Light outputs through face of each letter.",
    "Halo-Lit": "Back-lit halo effect around each letter.",
    "Face + Halo-Lit": "Combined face illumination and halo glow.",
  },
  finish: {
    Painted: "Solid coated finish in selected paint color.",
    Brushed: "Directional grain with satin metallic appearance.",
    Polished: "High-shine reflective metallic finish.",
    Anodized: "Electrochemical protective metallic finish.",
    Patina: "Oxidized/weathered decorative finish.",
    Raw: "Natural untreated metal finish.",
  },
};

const productReferenceMap = {
  "Flat Cut Metal": { page: "016", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_016.jpg", label: "Gemini Catalog Page 16 — Flat Cut Metal", description: "Flat sheet-cut metal letters for clean dimensional branding.", notes: "Best for non-lit signage with precise, crisp edges." },
  "Fabricated Non-Lit": { page: "017", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_017.jpg", label: "Gemini Catalog Page 17 — Fabricated Metal", description: "Built-up fabricated metal letters with depth and returns.", notes: "Use when visual depth and premium profile are required." },
  "Flat Cut Acrylic": { page: "036", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_036.jpg", label: "Gemini Catalog Page 36 — Flat Cut Acrylic", description: "Precision-cut acrylic letters in multiple colors/thicknesses.", notes: "Popular for interior lobbies and directional signage." },
  "Formed Plastic": { page: "047", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_047.jpg", label: "Gemini Catalog Page 47 — Formed Plastic", description: "Vacuum/mold formed plastic letters for economical dimension.", notes: "Lightweight option with good durability." },
  "Cast Metal": { page: "075", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_075.jpg", label: "Gemini Catalog Page 75 — Cast Metal", description: "Cast bronze/aluminum letters with substantial body.", notes: "Classic architectural look with long service life." },
  "Face Lit": { page: "092", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_092.jpg", label: "Gemini Catalog Page 92 — Face Lit", description: "Face-illuminated channel letters for night visibility.", notes: "Primary lighting exits through the face material." },
  "Halo Lit": { page: "168", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_168.jpg", label: "Gemini Catalog Page 168 — Halo Lit", description: "Reverse-lit channel letters with halo backglow effect.", notes: "Creates softer premium lighting against wall surface." },
  Plaques: { page: "198", fileName: "2026-U.S.-Professional-Signage-Catalog_Page_198.jpg", label: "Gemini Catalog Page 198 — Plaques", description: "Architectural plaques including donor, directory, and memorial styles.", notes: "Good for static information and commemorative signage." },
};

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
            <NumberField label="Freight Override ($, admin)" value={form.freightOverride} min={0} onChange={(value) => update("freightOverride", value)} />
            <NumberField label="Manual Unit Price ($, admin)" value={form.manualUnitPrice} min={0} onChange={(value) => update("manualUnitPrice", value)} />
            <NumberField label="Manual Final Retail ($, admin)" value={form.manualFinalRetail} min={0} onChange={(value) => update("manualFinalRetail", value)} />
            <label>
              Admin Notes
              <textarea style={{ ...fieldStyle, minHeight: 72 }} value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} />
            </label>
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
          <AdminVisualPanels form={form} metrics={metrics} />

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

function AdminVisualPanels({ form, metrics }) {
  const reference = productReferenceMap[form.productType];
  return (
    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #cbd5e1", padding: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Product Reference</h3>
        {reference ? (
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc" }}>
            <div style={{ fontWeight: 700 }}>Reference: {reference.label}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>File: /data/Gemini_Catalog/{reference.fileName}</div>
          </div>
        ) : <div style={{ border: "1px dashed #94a3b8", borderRadius: 8, padding: 10 }}>No catalog preview available yet.</div>}
        <p style={{ marginBottom: 4 }}><strong>Description:</strong> {reference?.description || "No product description available yet."}</p>
        <p style={{ marginTop: 4, marginBottom: 0 }}><strong>Notes:</strong> {reference?.notes || "No admin notes available yet."}</p>
        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: "#64748b" }}>
          Catalog image preview will be enabled once assets are moved to /public/gemini-catalog/.
        </p>
      </div>

      <LiveLetterMockup form={form} metrics={metrics} />
    </div>
  );
}

function LiveLetterMockup({ form, metrics }) {
  const lines = metrics.lines;
  const align = form.previewAlignment === "right" ? "right" : form.previewAlignment === "center" ? "center" : "left";
  const [background, setBackground] = useState("light-wall");
  const [previewMode, setPreviewMode] = useState("clean");
  const isFabricated = /fabricated/i.test(form.productType);
  const isFlatCut = /flat cut/i.test(form.productType);
  const finishLabel = `${form.finish} ${form.material}`.toLowerCase();
  const depthScale = { '1/8"': 1, '1/4"': 2, '3/8"': 3, '1/2"': 5, '3/4"': 7, '1"': 9, '1.5"': 11, '2"': 14, Custom: 16 };
  const returnDepthScale = { '1/2"': 5, '1"': 8, '1.5"': 11, '2"': 14, Custom: 16 };
  const baseDepth = Math.max(depthScale[form.thickness] || 2, returnDepthScale[form.returnDepth] || 2);
  const depth = isFabricated ? Math.min(6, Math.max(3, Math.round(baseDepth / 2))) : isFlatCut ? Math.min(3, Math.max(1, Math.round(baseDepth / 3))) : Math.min(5, Math.max(2, Math.round(baseDepth / 2.5)));
  const glow = form.lighting === "Halo-Lit"
    ? "0 2px 4px rgba(15,23,42,.35), 0 0 14px rgba(96,165,250,.7), 0 0 24px rgba(186,230,253,.6)"
    : form.lighting === "Face-Lit"
      ? "0 1px 3px rgba(15,23,42,.3), 0 0 10px rgba(255,255,255,.65), 0 0 18px rgba(125,211,252,.45)"
      : form.lighting === "Face + Halo-Lit"
        ? "0 1px 3px rgba(15,23,42,.3), 0 0 12px rgba(255,255,255,.65), 0 0 24px rgba(125,211,252,.55), 0 0 32px rgba(147,197,253,.42)"
        : "0 1px 2px rgba(15,23,42,.3)";
  const fill = finishLabel.includes("brushed") || finishLabel.includes("stainless")
    ? "linear-gradient(100deg,#d8e0e7 0%,#8f9aa4 26%,#edf2f7 49%,#96a2ad 71%,#e2e8f0 100%)"
    : finishLabel.includes("polished")
      ? "linear-gradient(100deg,#ffffff 0%,#cfd8e3 28%,#ffffff 50%,#aab6c5 70%,#f8fafc 100%)"
      : finishLabel.includes("bronze") || finishLabel.includes("brass")
        ? "linear-gradient(100deg,#f3d7a7 0%,#b88746 35%,#f8e2bc 58%,#9d6f37 82%,#e7c893 100%)"
        : finishLabel.includes("black")
          ? "linear-gradient(100deg,#4b5563 0%,#111827 45%,#374151 100%)"
          : finishLabel.includes("painted")
            ? "linear-gradient(100deg,#64748b 0%,#334155 65%,#1e293b 100%)"
            : /acrylic|lit/i.test(finishLabel + form.productType)
              ? "linear-gradient(180deg,#f8fbff 0%,#cfe7ff 38%,#6b9fd8 70%,#dbeafe 100%)"
              : "linear-gradient(100deg,#d4d4d8 0%,#71717a 45%,#e4e4e7 100%)";
  const sideColor = isFabricated ? "rgba(51,65,85,.45)" : "rgba(71,85,105,.3)";
  const standoffShadow = form.mounting === "Stud Mount" ? "0 2px 5px rgba(15,23,42,.18)" : form.mounting === "Pad Mount" ? "0 2px 4px rgba(15,23,42,.16)" : form.mounting === "Double-Face Tape" ? "0 1px 2px rgba(15,23,42,.1)" : "0 2px 4px rgba(15,23,42,.14)";
  const backgroundStyleMap = {
    "light-wall": "linear-gradient(180deg,#f8fafc,#edf2f7)",
    "dark-wall": "linear-gradient(180deg,#334155,#1e293b)",
    brick: "repeating-linear-gradient(0deg,#9b735f 0 24px,#8d654f 24px 25px), repeating-linear-gradient(90deg,#ac826a 0 64px,#97715a 64px 65px)",
    wood: "repeating-linear-gradient(90deg,#8a6b4f 0 30px,#7a5d43 30px 60px,#6e523b 60px 90px)",
  };

  const renderReturnShadow = (layerDepth) => Array.from({ length: layerDepth }, (_, idx) => `${Math.min(4, idx + 1)}px ${Math.min(4, idx + 1)}px 0 ${sideColor}`).join(",");
  const grainOverlay = finishLabel.includes("brushed") || finishLabel.includes("stainless")
    ? "repeating-linear-gradient(100deg, rgba(255,255,255,.14) 0 2px, rgba(148,163,184,.08) 2px 4px)"
    : "none";

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #cbd5e1", padding: 12 }}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Live Letter Mockup</h3>
      <div style={{ display: "grid", gap: 10 }}>
        <OptionHelp label="Product Type" value={form.productType} description={optionDescriptions.productType[form.productType]} />
        <OptionHelp label="Mounting" value={form.mounting} description={optionDescriptions.mounting[form.mounting]} />
        <OptionHelp label="Lighting" value={form.lighting} description={optionDescriptions.lighting[form.lighting]} />
        <OptionHelp label="Finish" value={form.finish} description={optionDescriptions.finish[form.finish]} />
      </div>
      <div style={{ marginTop: 10 }}>
        <label>Sign Text / Wording</label>
        <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Character count: {metrics.totalCharacters} · Billable: {metrics.billableCharacters} · Approx letters: {metrics.letters} · Spaces/punctuation: {metrics.spaces + metrics.punctuation}</div>
      </div>
      <label style={{ display: "block", marginTop: 10 }}>
        Preview Background
        <select style={fieldStyle} value={background} onChange={(e) => setBackground(e.target.value)}>
          <option value="light-wall">Light wall</option>
          <option value="dark-wall">Dark wall</option>
          <option value="brick">Brick</option>
          <option value="wood">Wood / slat wall</option>
        </select>
      </label>
      <label style={{ display: "block", marginTop: 10 }}>
        Preview Mode
        <select style={fieldStyle} value={previewMode} onChange={(e) => setPreviewMode(e.target.value)}>
          <option value="clean">Clean Mockup</option>
          <option value="depth">Depth Emphasis</option>
        </select>
      </label>
      <div style={{ marginTop: 10, minHeight: 190, borderRadius: 8, border: "1px dashed #94a3b8", padding: 16, background: backgroundStyleMap[background], backgroundSize: "cover", textAlign: align, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
        {form.mounting === "Raceway" && <div style={{ position: "absolute", left: "12%", right: "12%", top: "44%", height: 10, borderRadius: 6, background: "linear-gradient(180deg,#94a3b8,#64748b)", boxShadow: "0 1px 4px rgba(15,23,42,.2)" }} />}
        {lines.map((line, idx) => (
          <div
            key={`${idx}-${line}`}
            style={{
              fontSize: "clamp(30px, 5.2vw, 42px)",
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: ".06em",
              color: "transparent",
              background: grainOverlay === "none" ? fill : `${grainOverlay}, ${fill}`,
              WebkitBackgroundClip: "text",
              textShadow: `${renderReturnShadow(previewMode === "depth" ? Math.min(6, depth + 1) : depth)}, ${standoffShadow}, ${glow}`,
              transform: form.productType === "Flat Cut Acrylic" ? "skewX(-1deg)" : "none",
              minHeight: 48,
              position: "relative",
              zIndex: 2,
              filter: finishLabel.includes("brushed") ? "brightness(1.05) contrast(1.05)" : finishLabel.includes("acrylic") ? "brightness(1.1)" : "none",
              textAlign: align,
            }}
          >
            {line || "‎"}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>Preview is for visual reference only and not production artwork.</div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
        <MatchCell label="Product Type" value={form.productType} />
        <MatchCell label="Material" value={form.material} />
        <MatchCell label="Finish" value={form.finish} />
        <MatchCell label="Depth" value={`${form.thickness} / ${form.returnDepth}`} />
        <MatchCell label="Mounting" value={form.mounting} />
        <MatchCell label="Lighting" value={form.lighting} />
        <MatchCell label="Text entered" value={lines.filter(Boolean).join(" / ") || "—"} />
      </div>
    </div>
  );
}

function OptionHelp({ label, value, description }) {
  return <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}><strong>{label}:</strong> {value}<div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{description || "Description coming soon."}</div></div>;
}

function NumberField({ label, value, onChange, min = 1, step = 1 }) {
  return <label>{label}<input type="number" min={min} step={step} style={fieldStyle} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} /></label>;
}

function QuoteSummary({ form, metrics, pricingModel, isAdminView, mode }) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Quote Summary</h3>
      <p style={{ marginTop: 0, color: "#64748b" }}>Spreadsheet matched price is currently treated as retail/base unit price for admin-only testing.</p>
      {isAdminView ? (
        <>
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
  const calculatedFreight = (Number(form.freight) || 0) + (Number(form.oversizedFreight) || 0) + (Number(form.crateFee) || 0) + (Number(form.palletFee) || 0);
  const freightOverride = Number(form.freightOverride);
  const freight = Number.isFinite(freightOverride) && freightOverride >= 0 ? freightOverride : calculatedFreight;
  const adjustment = Number(form.adjustment) || 0;
  const sourcePrice = debug?.bestMatch?.numericPrice ?? null;
  const manualUnitPrice = Number(form.manualUnitPrice);
  const hasManualUnitPrice = Number.isFinite(manualUnitPrice) && manualUnitPrice >= 0;
  const matchedUnitPrice = sourcePrice;
  const unitPrice = hasManualUnitPrice ? manualUnitPrice : matchedUnitPrice;
  const effectiveSets = sets > 0 ? sets : 1;
  const billableCharacters = quantity * characterCount * effectiveSets;
  const subtotal = unitPrice != null ? unitPrice * billableCharacters : 0;
  const adjustedSubtotal = subtotal + adjustment;
  const computedEstimatedRetail = adjustedSubtotal + freight;
  const manualFinalRetail = Number(form.manualFinalRetail);
  const hasManualFinalRetail = Number.isFinite(manualFinalRetail) && manualFinalRetail >= 0;
  const estimatedRetail = hasManualFinalRetail ? manualFinalRetail : computedEstimatedRetail;

  const requiredFields = ["productType", "material", "finish", "thickness", "mounting", "lighting", "letterHeight"];
  const missingSelections = requiredFields.filter((key) => !form[key]);
  const warnings = [];
  if (!debug?.bestMatch) warnings.push("No pricing match found.");
  if (missingSelections.length) warnings.push(`Missing required selections: ${missingSelections.join(", ")}.`);
  if (debug?.bestMatch && matchedUnitPrice == null) warnings.push("Pricing value unavailable for the matched catalog row.");
  if (debug?.warning) warnings.push(debug.warning);
  const status = !debug?.bestMatch ? "No Match Found" : debug?.bestMatch?.usedFallback ? "Closest Match Used" : "Pricing Match Found";

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
        <div style={{ marginBottom: 10, fontWeight: 700, color: status === "No Match Found" ? "#b45309" : "#166534" }}>Status: {status}</div>
        {hasManualUnitPrice && <div style={{ marginBottom: 10, color: "#1d4ed8", fontWeight: 700 }}>Manual price override active</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          <MatchCell label="Product type" value={form.productType} />
          <MatchCell label="Material" value={form.material} />
          <MatchCell label="Finish" value={form.finish} />
          <MatchCell label="Thickness/depth" value={`${form.thickness} / ${form.returnDepth}`} />
          <MatchCell label="Letter height" value={`${form.letterHeight} in`} />
          <MatchCell label="Mounting" value={form.mounting} />
          <MatchCell label="Lighting" value={form.lighting} />
          <MatchCell label="Sign text / lines" value={metrics.lines.filter(Boolean).join(" | ") || "—"} />
          <MatchCell label="Billable characters" value={String(billableCharacters)} />
          <MatchCell label="Sets" value={String(effectiveSets)} />
          <MatchCell label="Matched unit price" value={unitPrice != null ? `$${unitPrice.toFixed(2)}` : "—"} />
          <MatchCell label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          <MatchCell label="Freight" value={`$${freight.toFixed(2)}`} />
          <MatchCell label="Adjustments" value={`$${adjustment.toFixed(2)}`} />
          <MatchCell label="Final estimated retail" value={`$${estimatedRetail.toFixed(2)}`} />
          <MatchCell label="Manual unit price" value={hasManualUnitPrice ? `$${manualUnitPrice.toFixed(2)}` : "—"} />
          <MatchCell label="Manual final retail" value={hasManualFinalRetail ? `$${manualFinalRetail.toFixed(2)}` : "—"} />
          <MatchCell label="Freight override" value={Number.isFinite(freightOverride) && freightOverride >= 0 ? `$${freightOverride.toFixed(2)}` : "—"} />
          <MatchCell label="Notes" value={form.notes || "—"} />
        </div>
      </div>

      <details style={{ background: "#fff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 10 }}>
        <summary style={{ fontWeight: 700, cursor: "pointer" }}>Advanced Debug Info</summary>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          <MatchCell label="source sheet/tab" value={debug?.bestMatch?.sourceSheetName} />
          <MatchCell label="source row" value={debug?.bestMatch?.sourceRow ? String(debug.bestMatch.sourceRow) : "—"} />
          <MatchCell label="matched column" value={debug?.bestMatch?.matchedColumn || "—"} />
          <MatchCell label="matched price" value={debug?.bestMatch?.matchedPrice || "—"} />
          <MatchCell label="reason if no match" value={debug?.reasonNoMatch || "—"} />
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
