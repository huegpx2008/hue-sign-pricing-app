"use client";

import { useState } from "react";
import { Box, Check, Field, input } from "../FormControls";

export default function DTFTransfers() {
  const [sanMarSearch, setSanMarSearch] = useState("");
  const [product, setProduct] = useState("Select product");
  const [color, setColor] = useState("Select color");
  const [size, setSize] = useState("Select size range");
  const [frontPreset, setFrontPreset] = useState("None");
  const [backPreset, setBackPreset] = useState("None");
  const [leftSleeve, setLeftSleeve] = useState(false);
  const [rightSleeve, setRightSleeve] = useState(false);
  const [padding, setPadding] = useState(0.25);
  const [qtySxl, setQtySxl] = useState(0);
  const [qty2xl, setQty2xl] = useState(0);
  const [qty3xl, setQty3xl] = useState(0);
  const [qty4xl, setQty4xl] = useState(0);
  const [qty5xl, setQty5xl] = useState(0);

  return (
    <>
      <Box title="DTF Transfers Product Setup">
        <label>SanMar Style Search</label>
        <input
          style={input}
          value={sanMarSearch}
          onChange={(e) => setSanMarSearch(e.target.value)}
          placeholder="Placeholder: Search style code or name"
        />

        <div className="formGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginTop: 15 }}>
          <div>
            <label>Product</label>
            <select style={input} value={product} onChange={(e) => setProduct(e.target.value)}><option>Select product</option></select>
          </div>
          <div>
            <label>Color</label>
            <select style={input} value={color} onChange={(e) => setColor(e.target.value)}><option>Select color</option></select>
          </div>
          <div>
            <label>Size</label>
            <select style={input} value={size} onChange={(e) => setSize(e.target.value)}><option>Select size range</option></select>
          </div>
        </div>

        <div className="formGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 }}>
          <div>
            <label>Front Print Preset</label>
            <select style={input} value={frontPreset} onChange={(e) => setFrontPreset(e.target.value)}><option>None</option></select>
          </div>
          <div>
            <label>Back Print Preset</label>
            <select style={input} value={backPreset} onChange={(e) => setBackPreset(e.target.value)}><option>None</option></select>
          </div>
        </div>

        <Check label="Left Sleeve Print" value={leftSleeve} setValue={setLeftSleeve} />
        <Check label="Right Sleeve Print" value={rightSleeve} setValue={setRightSleeve} />
        <Field label="Padding (inches)" value={padding} setValue={setPadding} />
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
      <Box title="SanMar Lookup Results"><p style={{ margin: 0, opacity: 0.8 }}>Placeholder: SanMar style and inventory lookup results will appear here.</p></Box>
      <Box title="DTF Pricing Summary"><p style={{ margin: 0, opacity: 0.8 }}>Placeholder: DTF-specific pricing summary will appear here.</p></Box>
    </>
  );
}
