"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Check, input } from "../FormControls";
import { parseApparelCatalogCsv, sortApparelSizes } from "../../lib/catalog/apparel-catalog";
import { calculateEmbroideryPricing, PLACEMENTS } from "../../lib/pricing/embroidery";

const DATA_PATH = "/data/SanMar_SDL_hue.csv";
const DEFAULT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const QUICK_STYLES = [{ code: "K540", label: "K540 — Silk Touch Polo" }, { code: "NE501", label: "NE501 — New Era Cap" }, { code: "C112", label: "C112 — Richardson Cap" }, { code: "BG99", label: "BG99 — Cinch Bag" }];
const n=(v)=>Number.parseFloat(String(v??"").replace(/[^0-9.-]/g,""))||0; const zeroQty=(sizes=DEFAULT_SIZES)=>Object.fromEntries(sizes.map((s)=>[s,"0"])); const item=(id)=>({id,search:"",styleKey:"",color:"",sizeQty:zeroQty(),open:false});
const sortSizes=sortApparelSizes;

export default function Embroidery({ onSummaryChange, isAdminView = false }) {
  const [rows,setRows]=useState([]); const [lineItems,setLineItems]=useState([item(1)]); const [placements,setPlacements]=useState(["Left Chest"]);
  const [stitchCount,setStitchCount]=useState(5000); const [threadColors,setThreadColors]=useState(2); const [addNames,setAddNames]=useState(false); const [largeNames,setLargeNames]=useState(false);
  const [addNumbers,setAddNumbers]=useState(false); const [largeNumbers,setLargeNumbers]=useState(false); const [puff3mm,setPuff3mm]=useState(false); const [digitizingStatus,setDigitizingStatus]=useState("Reorder / Digitized File On Hand");
  const [manualMode,setManualMode]=useState(false); const [manualName,setManualName]=useState(""); const [manualColor,setManualColor]=useState(""); const [manualQty,setManualQty]=useState("0"); const [manualCostEach,setManualCostEach]=useState("0");
  const [targetRetailPricePerItem,setTargetRetailPricePerItem]=useState("");
  useEffect(()=>{fetch(DATA_PATH).then((r)=>r.text()).then((txt)=>setRows(parseApparelCatalogCsv(txt))).catch(()=>setRows([]));},[]);
  const styles=useMemo(()=>{const m=new Map();rows.forEach((r)=>{const k=`${r.style}__${r.title}`;if(!m.has(k))m.set(k,{key:k,style:r.style,title:r.title,rows:[]});m.get(k).rows.push(r);});return m;},[rows]);
  const setLI=(id,u)=>setLineItems((p)=>p.map((x)=>x.id===id?u(x):x));
  const pick=(id,key)=>{const g=styles.get(key);const sizes=sortSizes((g?.rows||[]).map((r)=>r.size));setLI(id,(x)=>({...x,styleKey:key,search:g?`${g.style} — ${g.title}`:"",open:false,color:x.color&&g?.rows.find((r)=>r.color===x.color)?x.color:"",sizeQty:zeroQty(sizes.length?sizes:DEFAULT_SIZES)}));setTimeout(()=>document.getElementById("emb-stitch-count")?.focus(),0);};

  const summary=useMemo(()=>calculateEmbroideryPricing({targetRetailPricePerItem,manualMode,manualName,manualColor,manualQty,manualCostEach,lineItems,stitchCount,threadColors,addNames,largeNames,addNumbers,largeNumbers,puff3mm,digitizingStatus,placements},{stylesByKey:styles}),[targetRetailPricePerItem,manualMode,manualName,manualColor,manualQty,manualCostEach,lineItems,styles,stitchCount,threadColors,addNames,largeNames,addNumbers,largeNumbers,puff3mm,digitizingStatus,placements]);
  useEffect(()=>onSummaryChange?.(summary),[summary,onSummaryChange]);

  return <Box title="Embroidery">{summary.minimumWarning&&<p style={{color:"#f59e0b",fontWeight:600}}>Minimum is 5 pieces. Quote is still allowed.</p>}
  {isAdminView && <Check label="Manual Garment Entry" value={manualMode} setValue={setManualMode} />}
  {!manualMode && lineItems.map((li)=>{const g=styles.get(li.styleKey);const matches=li.search?[...styles.values()].filter((s)=>`${s.style} ${s.title}`.toLowerCase().includes(li.search.toLowerCase())).slice(0,25):[];const colors=g?[...new Set(g.rows.map((r)=>r.color).filter(Boolean))]:[];const det=summary.lineItems.find((x)=>x.id===li.id);
    return <div key={li.id} style={{border:"1px solid #334155",padding:12,borderRadius:10,marginBottom:10}}><div className="buttonGrid" style={{marginBottom:8}}>{QUICK_STYLES.map((opt)=><button key={`${li.id}-${opt.code}`} className={`presetBtn ${g?.style===opt.code?"activePreset":""}`} onClick={()=>{const found=[...styles.values()].find((s)=>s.style.toLowerCase()===opt.code.toLowerCase());if(found) pick(li.id,found.key);}}>{opt.label}</button>)}</div>
    <input style={input} placeholder="Search style # or product" value={li.search} onFocus={()=>setLI(li.id,(x)=>({...x,open:true}))} onChange={(e)=>setLI(li.id,(x)=>({...x,search:e.target.value,open:true,styleKey:""}))} />
    {li.open&&matches.length>0&&<div style={{border:"1px solid #475569",borderRadius:8,maxHeight:180,overflowY:"auto",marginBottom:8}}>{matches.map((m)=><button key={m.key} className="modeBtn" style={{display:"block",width:"100%",textAlign:"left",margin:0,borderRadius:0,padding:"10px 12px"}} onClick={()=>pick(li.id,m.key)}>{m.style} — {m.title}</button>)}</div>}
    <select style={input} value={li.color} onChange={(e)=>setLI(li.id,(x)=>({...x,color:e.target.value}))}><option value="">Select color</option>{colors.map((c)=><option key={c}>{c}</option>)}</select>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:6}}>{sortSizes((g?.rows||[]).map((r)=>r.size)).map((s)=><label key={s} style={{fontSize:12}}>{s}<input style={{...input,marginTop:4,padding:"6px 8px"}} value={li.sizeQty[s]||"0"} onChange={(e)=>setLI(li.id,(x)=>({...x,sizeQty:{...x.sizeQty,[s]:e.target.value.replace(/[^0-9]/g,"")}}))} onBlur={()=>setLI(li.id,(x)=>({...x,sizeQty:{...x.sizeQty,[s]:x.sizeQty[s]===""?"0":String(n(x.sizeQty[s]))}}))}/></label>)}</div>
    <p>Total Qty: {det?.totalQty||0}</p>{lineItems.length>1&&<button className="modeBtn" onClick={()=>setLineItems((p)=>p.filter((x)=>x.id!==li.id))}>Remove line item</button>}</div>;})}
  {!manualMode && <button className="modeBtn" style={{width:"100%"}} onClick={()=>setLineItems((p)=>[...p,item(Date.now())])}>+ Add apparel line item</button>}
  {manualMode && <div style={{border:"1px solid #334155",padding:12,borderRadius:10,marginBottom:10}}>
    <label>Garment/Product Name</label><input style={input} value={manualName} onChange={(e)=>setManualName(e.target.value)} />
    <label>Color</label><input style={input} value={manualColor} onChange={(e)=>setManualColor(e.target.value)} />
    <label>Quantity</label><input style={input} value={manualQty} onChange={(e)=>setManualQty(e.target.value.replace(/[^0-9]/g,""))} />
    <label>Manual garment cost per item</label><input style={input} value={manualCostEach} onChange={(e)=>setManualCostEach(e.target.value.replace(/[^0-9.]/g,""))} />
  </div>}
  {isAdminView && <><label>Target Retail Price Per Item</label><input style={input} placeholder="Optional override / what-if per-item price" value={targetRetailPricePerItem} onChange={(e)=>setTargetRetailPricePerItem(e.target.value.replace(/[^0-9.]/g,""))} /></>}
  <label>Stitch Count</label><input id="emb-stitch-count" style={input} value={stitchCount} onChange={(e)=>setStitchCount(n(e.target.value))} />
  <label>Thread Colors</label><input style={input} value={threadColors} onChange={(e)=>setThreadColors(n(e.target.value))} />
  <label>Placements</label><select style={input} value={placements[0]} onChange={(e)=>setPlacements([e.target.value])}>{PLACEMENTS.map((p)=><option key={p}>{p}</option>)}</select>
  <Check label="Add Names/Titles" value={addNames} setValue={setAddNames} />{addNames&&<Check label={'Large Names/Titles (>2\" high or 4+ words)'} value={largeNames} setValue={setLargeNames} />}
  <Check label="Add Numbers" value={addNumbers} setValue={setAddNumbers} />{addNumbers&&<Check label={'Large numbers (>3\" high)'} value={largeNumbers} setValue={setLargeNumbers} />}
  <Check label="3mm Puff Embroidery" value={puff3mm} setValue={setPuff3mm} />
  <label>Digitized File Status</label><select style={input} value={digitizingStatus} onChange={(e)=>setDigitizingStatus(e.target.value)}><option>Reorder / Digitized File On Hand</option><option>New Logo / Needs Digitizing</option></select>
  </Box>;
}
