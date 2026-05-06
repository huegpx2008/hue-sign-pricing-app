"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Check, Field, input } from "../FormControls";

const DATA_PATH = "/data/SanMar_SDL_hue.csv";

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function toNumber(value) {
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function DTFTransfers() {
  const DEFAULT_MARGIN_PERCENT = 60;
  const FRONT_PRESETS = {
    "Left Chest": { width: 4, height: 4 },
    "Full Front": { width: 11, height: 10 },
  };
  const BACK_PRESETS = {
    "Full Back": { width: 12.5, height: 13 },
  };
  const DEFAULT_SLEEVE_SIZE = { width: 3.5, height: 3.5 };
  const SIZE_UPCHARGES = {
    qty2xl: 2.5,
    qty3xl: 3.5,
    qty4xl: 4.5,
    qty5xl: 5,
  };

  const [sanMarSearch, setSanMarSearch] = useState("");
  const [product, setProduct] = useState("Select product");
  const [color, setColor] = useState("Select color");
  const [frontPreset, setFrontPreset] = useState("None");
  const [backPreset, setBackPreset] = useState("None");
  const [frontWidth, setFrontWidth] = useState(11);
  const [frontHeight, setFrontHeight] = useState(10);
  const [backWidth, setBackWidth] = useState(12.5);
  const [backHeight, setBackHeight] = useState(13);
  const [leftSleeve, setLeftSleeve] = useState(false);
  const [rightSleeve, setRightSleeve] = useState(false);
  const [leftSleeveCustomSize, setLeftSleeveCustomSize] = useState(false);
  const [rightSleeveCustomSize, setRightSleeveCustomSize] = useState(false);
  const [leftSleeveWidth, setLeftSleeveWidth] = useState(DEFAULT_SLEEVE_SIZE.width);
  const [leftSleeveHeight, setLeftSleeveHeight] = useState(DEFAULT_SLEEVE_SIZE.height);
  const [rightSleeveWidth, setRightSleeveWidth] = useState(DEFAULT_SLEEVE_SIZE.width);
  const [rightSleeveHeight, setRightSleeveHeight] = useState(DEFAULT_SLEEVE_SIZE.height);
  const [padding, setPadding] = useState(0.25);
  const [qtySxl, setQtySxl] = useState(0);
  const [qty2xl, setQty2xl] = useState(0);
  const [qty3xl, setQty3xl] = useState(0);
  const [qty4xl, setQty4xl] = useState(0);
  const [qty5xl, setQty5xl] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [selectedStyleKey, setSelectedStyleKey] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [apparelCost, setApparelCost] = useState("");
  const [manualApparelCost, setManualApparelCost] = useState(false);

  const totalGarmentQty = useMemo(() => (
    toNumber(qtySxl) + toNumber(qty2xl) + toNumber(qty3xl) + toNumber(qty4xl) + toNumber(qty5xl)
  ), [qtySxl, qty2xl, qty3xl, qty4xl, qty5xl]);

  const baseApparelCostUsed = useMemo(() => toNumber(apparelCost), [apparelCost]);

  const sizeUpchargeTotal = useMemo(() => (
    toNumber(qty2xl) * SIZE_UPCHARGES.qty2xl
    + toNumber(qty3xl) * SIZE_UPCHARGES.qty3xl
    + toNumber(qty4xl) * SIZE_UPCHARGES.qty4xl
    + toNumber(qty5xl) * SIZE_UPCHARGES.qty5xl
  ), [qty2xl, qty3xl, qty4xl, qty5xl]);

  const apparelDirectCost = useMemo(() => totalGarmentQty * baseApparelCostUsed, [totalGarmentQty, baseApparelCostUsed]);

  const apparelCostWithMargin = useMemo(() => {
    const marginDecimal = DEFAULT_MARGIN_PERCENT / 100;
    if (marginDecimal >= 1) return 0;
    return apparelDirectCost / (1 - marginDecimal);
  }, [apparelDirectCost]);

  const apparelRetailSubtotal = useMemo(() => apparelCostWithMargin + sizeUpchargeTotal, [apparelCostWithMargin, sizeUpchargeTotal]);

  const frontSelected = frontPreset !== "None";
  const backSelected = backPreset !== "None";

  const resolvedFrontSize = useMemo(() => {
    if (frontPreset === "Custom Size") {
      return { width: toNumber(frontWidth), height: toNumber(frontHeight) };
    }
    return FRONT_PRESETS[frontPreset] || null;
  }, [frontPreset, frontWidth, frontHeight]);

  const resolvedBackSize = useMemo(() => {
    if (backPreset === "Custom Size") {
      return { width: toNumber(backWidth), height: toNumber(backHeight) };
    }
    return BACK_PRESETS[backPreset] || null;
  }, [backPreset, backWidth, backHeight]);

  const resolvedLeftSleeveSize = leftSleeveCustomSize
    ? { width: toNumber(leftSleeveWidth), height: toNumber(leftSleeveHeight) }
    : DEFAULT_SLEEVE_SIZE;

  const resolvedRightSleeveSize = rightSleeveCustomSize
    ? { width: toNumber(rightSleeveWidth), height: toNumber(rightSleeveHeight) }
    : DEFAULT_SLEEVE_SIZE;

  const transferCountPerGarment =
    (frontSelected ? 1 : 0)
    + (backSelected ? 1 : 0)
    + (leftSleeve ? 1 : 0)
    + (rightSleeve ? 1 : 0);

  const totalTransferCount = transferCountPerGarment * totalGarmentQty;

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;

    let mounted = true;
    loadedRef.current = true;
    setLoading(true);
    fetch(DATA_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load CSV (${response.status})`);
        return response.text();
      })
      .then((text) => {
        if (!mounted) return;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (!lines.length) {
          setCsvRows([]);
          return;
        }

        const headers = parseCsvLine(lines[0]);
        const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));

        const parsed = lines.slice(1).map((line) => parseCsvLine(line)).map((cols) => ({
          style: cols[headerIndex["STYLE#"]] || "",
          title: cols[headerIndex.PRODUCT_TITLE] || "",
          color: cols[headerIndex.COLOR_NAME] || "",
          size: cols[headerIndex.SIZE] || "",
          casePriceRaw: cols[headerIndex.CASE_PRICE] || "",
          casePrice: toNumber(cols[headerIndex.CASE_PRICE]),
          caseSize: cols[headerIndex.CASE_SIZE] || "",
        })).filter((row) => row.style && row.title);

        setCsvRows(parsed);
      })
      .catch((error) => {
        if (!mounted) return;
        setLoadError(error.message || "Failed to load CSV");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stylesByKey = useMemo(() => {
    const map = new Map();
    for (const row of csvRows) {
      const key = `${row.style}__${row.title}`;
      if (!map.has(key)) {
        map.set(key, { key, style: row.style, title: row.title, rows: [] });
      }
      map.get(key).rows.push(row);
    }
    return map;
  }, [csvRows]);

  const filteredStyles = useMemo(() => {
    const term = sanMarSearch.trim().toLowerCase();
    if (!term) return [];
    const matches = [];
    for (const styleGroup of stylesByKey.values()) {
      const haystack = `${styleGroup.style} ${styleGroup.title}`.toLowerCase();
      if (haystack.includes(term)) {
        matches.push(styleGroup);
      }
    }
    return matches.slice(0, 50);
  }, [sanMarSearch, stylesByKey]);

  const selectedStyle = selectedStyleKey ? stylesByKey.get(selectedStyleKey) : null;

  const availableColors = useMemo(() => {
    if (!selectedStyle) return [];
    return [...new Set(selectedStyle.rows.map((row) => row.color).filter(Boolean))].sort();
  }, [selectedStyle]);

  useEffect(() => {
    if (!selectedStyle || color === "Select color") return;
    const matched = selectedStyle.rows.find((row) => row.color === color) || null;
    setSelectedProduct(matched);
    if (matched && !manualApparelCost) {
      setApparelCost(String(matched.casePrice));
    }
    if (matched) {
      setSanMarSearch("");
    }
  }, [selectedStyle, color, manualApparelCost]);

  function handleStyleSelect(styleKey) {
    const styleGroup = stylesByKey.get(styleKey);
    setSelectedStyleKey(styleKey);
    setProduct(styleGroup ? `${styleGroup.style} — ${styleGroup.title}` : "Select product");
    setColor("Select color");
    setSelectedProduct(null);
  }

  function handleManualApparelCostChange(value) {
    setManualApparelCost(value !== "");
    setApparelCost(value);
  }

  return (
    <>
      <Box title="DTF Transfers Product Setup">
        <label>SanMar Style Search</label>
        <input
          style={input}
          value={sanMarSearch}
          onChange={(e) => setSanMarSearch(e.target.value)}
          placeholder="Search by STYLE# or product title"
        />
        {loading && <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.8 }}>Loading SanMar catalog…</p>}
        {!loading && sanMarSearch && filteredStyles.length === 0 && !loadError && (
          <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.8 }}>No results found.</p>
        )}
        {loadError && <p style={{ margin: "8px 0 0", fontSize: 14, color: "#b91c1c" }}>{loadError}</p>}

        {!loading && sanMarSearch && filteredStyles.length > 0 && (
          <div style={{ marginTop: 10, border: "1px solid #64748b", borderRadius: 10, maxHeight: 220, overflowY: "auto", background: "rgba(15,23,42,0.92)", color: "#e5e7eb" }}>
            {filteredStyles.map((styleGroup) => (
              <button
                key={styleGroup.key}
                type="button"
                onClick={() => handleStyleSelect(styleGroup.key)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: selectedStyleKey === styleGroup.key ? "rgba(59,130,246,0.22)" : "transparent",
                  color: "inherit",
                  padding: 10,
                  cursor: "pointer",
                }}
              >
                <strong>{styleGroup.style}</strong> — {styleGroup.title}
              </button>
            ))}
          </div>
        )}

        <div className="formGrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 15, marginTop: 15 }}>
          <div>
            <label>Product</label>
            <select style={input} value={product} onChange={(e) => setProduct(e.target.value)}><option>{product}</option></select>
          </div>
          <div>
            <label>Color</label>
            <select style={input} value={color} onChange={(e) => setColor(e.target.value)}>
              <option>Select color</option>
              {availableColors.map((colorName) => <option key={colorName}>{colorName}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 15 }}>
          <label>Apparel Cost (manual override supported)</label>
          <input style={input} type="number" step="0.01" value={apparelCost} onChange={(e) => handleManualApparelCostChange(e.target.value)} placeholder="Auto-filled from CASE_PRICE" />
        </div>

        <div className="formGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 }}>
          <div>
            <label>Front Print Preset</label>
            <select style={input} value={frontPreset} onChange={(e) => setFrontPreset(e.target.value)}>
              <option>None</option>
              <option>Left Chest</option>
              <option>Full Front</option>
              <option>Custom Size</option>
            </select>
          </div>
          {frontPreset === "Custom Size" && (
            <>
              <Field label="Front Width (in)" value={frontWidth} setValue={setFrontWidth} />
              <Field label="Front Height (in)" value={frontHeight} setValue={setFrontHeight} />
            </>
          )}
          <div>
            <label>Back Print Preset</label>
            <select style={input} value={backPreset} onChange={(e) => setBackPreset(e.target.value)}>
              <option>None</option>
              <option>Full Back</option>
              <option>Custom Size</option>
            </select>
          </div>
          {backPreset === "Custom Size" && (
            <>
              <Field label="Back Width (in)" value={backWidth} setValue={setBackWidth} />
              <Field label="Back Height (in)" value={backHeight} setValue={setBackHeight} />
            </>
          )}
        </div>

        <Check label="Left Sleeve Print" value={leftSleeve} setValue={setLeftSleeve} />
        {leftSleeve && (
          <>
            <Check label="Custom Left Sleeve Size" value={leftSleeveCustomSize} setValue={setLeftSleeveCustomSize} />
            {leftSleeveCustomSize && (
              <div className="formGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <Field label="Left Sleeve Width (in)" value={leftSleeveWidth} setValue={setLeftSleeveWidth} />
                <Field label="Left Sleeve Height (in)" value={leftSleeveHeight} setValue={setLeftSleeveHeight} />
              </div>
            )}
          </>
        )}
        <Check label="Right Sleeve Print" value={rightSleeve} setValue={setRightSleeve} />
        {rightSleeve && (
          <>
            <Check label="Custom Right Sleeve Size" value={rightSleeveCustomSize} setValue={setRightSleeveCustomSize} />
            {rightSleeveCustomSize && (
              <div className="formGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <Field label="Right Sleeve Width (in)" value={rightSleeveWidth} setValue={setRightSleeveWidth} />
                <Field label="Right Sleeve Height (in)" value={rightSleeveHeight} setValue={setRightSleeveHeight} />
              </div>
            )}
          </>
        )}
        <Field label="Padding (inches)" value={padding} setValue={setPadding} />
      </Box>

      <Box title="Selected SanMar Product">
        {!selectedProduct && <p style={{ margin: 0, opacity: 0.8 }}>Select style and color to load SanMar product details.</p>}
        {selectedProduct && (
          <div style={{ display: "grid", gap: 6 }}>
            <div><strong>Style #:</strong> {selectedProduct.style}</div>
            <div><strong>Product:</strong> {selectedProduct.title}</div>
            <div><strong>Color:</strong> {selectedProduct.color}</div>
            <div><strong>Case Price:</strong> {selectedProduct.casePriceRaw || "N/A"}</div>
            <div><strong>Case Size:</strong> {selectedProduct.caseSize || "N/A"}</div>
          </div>
        )}
      </Box>

      <Box title="Apparel Quantities">
        <div className="formGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <Field label="S-XL" value={qtySxl} setValue={setQtySxl} />
          <Field label="2XL" value={qty2xl} setValue={setQty2xl} />
          <Field label="3XL" value={qty3xl} setValue={setQty3xl} />
          <Field label="4XL" value={qty4xl} setValue={setQty4xl} />
          <Field label="5XL" value={qty5xl} setValue={setQty5xl} />
        </div>
      </Box>

      <Box title="DTF Roll Layout Preview"><p style={{ margin: 0, opacity: 0.8 }}>Placeholder: DTF roll nesting/layout preview will appear here.</p></Box>
      <Box title="DTF Pricing Summary">
        <div style={{ display: "grid", gap: 6 }}>
          <div><strong>Base apparel cost used:</strong> ${baseApparelCostUsed.toFixed(2)} {manualApparelCost ? "(manual override)" : "(SanMar CASE_PRICE)"}</div>
          <div><strong>Total garment quantity:</strong> {totalGarmentQty}</div>
          <div><strong>Size upcharge total:</strong> ${sizeUpchargeTotal.toFixed(2)}</div>
          <div><strong>Apparel direct cost:</strong> ${apparelDirectCost.toFixed(2)}</div>
          <div><strong>Apparel cost with margin ({DEFAULT_MARGIN_PERCENT}%):</strong> ${apparelCostWithMargin.toFixed(2)}</div>
          <div><strong>Apparel retail subtotal:</strong> ${apparelRetailSubtotal.toFixed(2)}</div>
          <div><strong>Front print:</strong> {frontPreset}{resolvedFrontSize ? ` (${resolvedFrontSize.width}\" x ${resolvedFrontSize.height}\")` : ""}</div>
          <div><strong>Back print:</strong> {backPreset}{resolvedBackSize ? ` (${resolvedBackSize.width}\" x ${resolvedBackSize.height}\")` : ""}</div>
          <div><strong>Left sleeve:</strong> {leftSleeve ? `Selected (${resolvedLeftSleeveSize.width}\" x ${resolvedLeftSleeveSize.height}\")` : "None"}</div>
          <div><strong>Right sleeve:</strong> {rightSleeve ? `Selected (${resolvedRightSleeveSize.width}\" x ${resolvedRightSleeveSize.height}\")` : "None"}</div>
          <div><strong>Transfer padding:</strong> {toNumber(padding)}"</div>
          <div><strong>Total transfer count:</strong> {totalTransferCount}</div>
        </div>
      </Box>
    </>
  );
}
