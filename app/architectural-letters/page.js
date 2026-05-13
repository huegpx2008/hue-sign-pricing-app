import Link from "next/link";

export default function ArchitecturalLettersPage() {
  const sections = [
    "Letter Text",
    "Material",
    "Letter Height",
    "Thickness / Depth",
    "Finish / Color",
    "Mounting Options",
    "Quantity / Character Count",
    "Quote Summary",
  ];

  return (
    <main style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", Verdana, sans-serif', minHeight: "100vh", padding: 20, background: "linear-gradient(160deg,#eff6ff,#f8fafc 45%,#fff)", color: "#0f172a" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: 16, color: "#1d4ed8", textDecoration: "none", fontWeight: 700 }}>
          ← Back to main pricing app
        </Link>
        <section style={{ background: "rgba(255,255,255,.92)", borderRadius: 16, borderTop: "1px solid rgba(30,64,175,.18)", boxShadow: "0 10px 30px rgba(15,23,42,.09)", padding: 20 }}>
          <h1 style={{ marginTop: 0, marginBottom: 6 }}>Architectural Letters</h1>
          <p style={{ marginTop: 0, color: "#334155" }}>Dimensional letter pricing</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
            {sections.map((section) => (
              <div key={section} style={{ border: "1px dashed #94a3b8", borderRadius: 10, padding: 12, background: "#f8fafc" }}>
                <h2 style={{ fontSize: 16, margin: "0 0 4px" }}>{section}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Section under construction.</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
