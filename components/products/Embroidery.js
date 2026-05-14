"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Check, input } from "../FormControls";

const DATA_PATH = "/data/SanMar_SDL_hue.csv";
const DEFAULT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const QUICK_STYLES = [{ code: "K540", label: "K540 — Silk Touch Polo" }, { code: "NE501", label: "NE501 — New Era Cap" }, { code: "C112", label: "C112 — Richardson Cap" }, { code: "BG99", label: "BG99 — Cinch Bag" }];
const STITCH_MATRIX = {5000:[6,4,3.75,3,2.75,2.5,2.25,2.05,1.95,1.9],6000:[6.5,4.5,4.15,3.4,3.05,2.8,2.45,2.25,2.15,2.1],7000:[7,5,4.55,3.8,3.35,3.1,2.65,2.45,2.35,2.3],8000:[7.5,5.5,4.95,4.2,3.65,3.4,2.85,2.65,2.55,2.5],9000:[8,6,5.35,4.6,3.95,3.7,3.05,2.85,2.75,2.7],10000:[8.5,6.5,5.75,5,4.25,4,3.25,3.05,2.95,2.9],11000:[9,7,6.15,5.4,4.55,4.3,3.45,3.25,3.15,3.1],12000:[9.5,7.5,6.55,5.8,4.85,4.6,3.65,3.45,3.35,3.3],13000:[10,8,6.95,6.2,5.15,4.9,3.85,3.65,3.55,3.5],14000:[10.5,8.5,7.35,6.6,5.45,5.2,4.05,3.85,3.75,3.7],15000:[11,9,7.75,7,5.75,5.5,4.25,4.05,3.95,3.9]};
const PLUS_PER_1K = [0.5,0.5,0.4,0.4,0.3,0.3,0.2,0.2,0.2,0.2];
const QTIERS = [{max:5},{max:11},{max:23},{max:35},{max:71},{max:143},{max:287},{max:575},{max:999},{max:Infinity}];
const PLACEMENTS=["Left Chest","Center Chest","Full Back","Sleeve","Hat Front","Hat Side","Beanie","Custom Placement"];
const n=(v)=>Number.parseFloat(String(v??"").replace(/[^0-9.-]/g,""))||0; const zeroQty=(sizes=DEFAULT_SIZES)=>Object.fromEntries(sizes.map((s)=>[s,"0"])); const item=(id)=>({id,search:"",styleKey:"",color:"",sizeQty:zeroQty(),open:false});
const tierIndex=(qty)=>QTIERS.findIndex((t)=>qty<=t.max);
const norm=(s)=>String(s||"").trim().toUpperCase();
const sortSizes=(sizes=[])=>{const order=["YXS","YS","YM","YL","YXL","OSFA","XS","S","M","L","XL","2XL","3XL","4XL","5XL","6XL","LT","XLT","2XLT"]; return [...new Set(sizes.map((s)=>norm(s)).filter(Boolean))].sort((a,b)=>{const ai=order.indexOf(a),bi=order.indexOf(b); if(ai!==-1||bi!==-1)return (ai===-1?999:ai)-(bi===-1?999:bi); return a.localeCompare(b);});};

export default function Embroidery({ onSummaryChange, isAdminView = false }) {
  const [rows,setRows]=useState([]); const [lineItems,setLineItems]=useState([item(1)]); const [placements,setPlacements]=useState(["Left Chest"]);
  const [stitchCount,setStitchCount]=useState(5000); const [threadColors,setThreadColors]=useState(2); const [addNames,setAddNames]=useState(false); const [largeNames,setLargeNames]=useState(false);
  const [addNumbers,setAddNumbers]=useState(false); const [largeNumbers,setLargeNumbers]=useState(false); const [puff3mm,setPuff3mm]=useState(false); const [digitizingStatus,setDigitizingStatus]=useState("Reorder / Digitized File On Hand");
  const [manualMode,setManualMode]=useState(false); const [manualName,setManualName]=useState(""); const [manualColor,setManualColor]=useState(""); const [manualQty,setManualQty]=useState("0"); const [manualCostEach,setManualCostEach]=useState("0");
  const [targetRetailPricePerItem,setTargetRetailPricePerItem]=useState("");
  useEffect(()=>{fetch(DATA_PATH).then((r)=>r.text()).then((txt)=>{const [h,...lines]=txt.split(/\r?\n/).filter(Boolean);const cols=h.split(",");const i=Object.fromEntries(cols.map((k,ix)=>[k.trim(),ix]));setRows(lines.map((line)=>{const c=line.split(",");return{style:c[i["STYLE#"]],title:c[i.PRODUCT_TITLE],color:c[i.COLOR_NAME],size:c[i.SIZE],casePrice:n(c[i.CASE_PRICE])};}));}).catch(()=>setRows([]));},[]);
  const styles=useMemo(()=>{const m=new Map();rows.forEach((r)=>{const k=`${r.style}__${r.title}`;if(!m.has(k))m.set(k,{key:k,style:r.style,title:r.title,rows:[]});m.get(k).rows.push(r);});return m;},[rows]);
  const setLI=(id,u)=>setLineItems((p)=>p.map((x)=>x.id===id?u(x):x));
  const pick=(id,key)=>{const g=styles.get(key);const sizes=sortSizes((g?.rows||[]).map((r)=>r.size));setLI(id,(x)=>({...x,styleKey:key,search:g?`${g.style} — ${g.title}`:"",open:false,color:x.color&&g?.rows.find((r)=>r.color===x.color)?x.color:"",sizeQty:zeroQty(sizes.length?sizes:DEFAULT_SIZES)}));setTimeout(()=>document.getElementById("emb-stitch-count")?.focus(),0);};

  const summary=useMemo(()=>{const li=(manualMode?[{id:"manual",style:manualName,title:manualName,color:manualColor,sizeQty:{OSFA:manualQty||"0"},totalQty:n(manualQty),garmentCost:n(manualQty)*n(manualCostEach),sizePriceBreakdown:[{size:"OSFA",qty:n(manualQty),blankCasePrice:n(manualCostEach)}],isCap:/cap|hat|beanie/i.test(`${manualName} ${placements.join(" ")}`)}]:lineItems.map((l)=>{const g=styles.get(l.styleKey); const t=Object.values(l.sizeQty).reduce((s,q)=>s+n(q),0); const matchedRows=(g?.rows||[]).filter((r)=>r.color===l.color);
    const lineSizes=sortSizes((g?.rows||[]).map((r)=>r.size));
    const garmentCost=lineSizes.reduce((s,sz)=>{const q=n(l.sizeQty[sz]);const row=matchedRows.find((r)=>norm(r.size)===sz);const fallback=(g?.rows||[]).find((r)=>norm(r.size)===sz);return s+((row?.casePrice ?? fallback?.casePrice) || 0)*q;},0);
    const sizePriceBreakdown=lineSizes.map((sz)=>{const qty=n(l.sizeQty[sz]);if(qty<=0)return null;const row=matchedRows.find((r)=>norm(r.size)===sz) || (g?.rows||[]).find((r)=>norm(r.size)===sz);const blank=row?.casePrice||0;return {size:sz,qty,blankCasePrice:blank};}).filter(Boolean);
    return {...l,style:g?.style||"",title:g?.title||"",totalQty:t,garmentCost,sizePriceBreakdown,isCap:/(cap|hat|beanie)/i.test(`${g?.title||""} ${placements.join(" ")}`)};}));
  const totalGarments=li.reduce((s,x)=>s+x.totalQty,0); const idx=Math.max(tierIndex(totalGarments||1),0);
  const rounded=Math.min(Math.max(Math.ceil(stitchCount/1000)*1000,5000),15000); const base=(STITCH_MATRIX[rounded]||STITCH_MATRIX[15000])[idx];
  const extra1k=stitchCount>15000?Math.ceil((stitchCount-15000)/1000):0; const stitchEach=stitchCount>15000?STITCH_MATRIX[15000][idx]+extra1k*PLUS_PER_1K[idx]:base;
  const threadExtraEach=Math.max(threadColors-2,0)*3; const namesEach=addNames?(largeNames?8:6):0; const numbersEach=addNumbers?(largeNumbers?STITCH_MATRIX[5000][0]:6):0; const puffEach=puff3mm?1.5:0;
  const embroideryEachDirect=stitchEach+threadExtraEach+namesEach+numbersEach+puffEach; const embroideryRetailEach=embroideryEachDirect/0.4;
  const apparelCost=li.reduce((s,x)=>s+x.garmentCost,0); const apparelRetail=apparelCost/0.4; const embroiderySubtotal=embroideryRetailEach*totalGarments;
  const handlingDirect=2; const handlingRetail=handlingDirect/0.4; const hasCaps=li.some((x)=>x.isCap&&x.totalQty>0); const hasFlats=li.some((x)=>!x.isCap&&x.totalQty>0);
  const digitizingFees=digitizingStatus.includes("Needs")?((hasCaps&&hasFlats)?110:55):0;
  const calculatedRetail=apparelRetail+embroiderySubtotal+handlingRetail+digitizingFees; const targetRetailPerItem=n(targetRetailPricePerItem); const targetRetailTotal=targetRetailPerItem>0?targetRetailPerItem*totalGarments:0; const retail=targetRetailPerItem>0?targetRetailTotal:calculatedRetail; const cost=apparelCost+(embroideryEachDirect*totalGarments)+handlingDirect+digitizingFees;
  const lineItemsWithAlloc=li.map((x)=>{const per=x.totalQty?((x.garmentCost/0.4)/x.totalQty)+embroideryRetailEach:0;const tiers=(x.sizePriceBreakdown||[]).map((t)=>({label:["S","M","L","XL"].includes(t.size)?"S-XL":t.size,qty:t.qty,priceEach:(t.blankCasePrice/0.4)+embroideryRetailEach}));return {...x,retailPerShirt:per,finalRetailSubtotal:per*x.totalQty,embroideryRetailEach,sizePriceBreakdown:tiers};});
  return {label:"Embroidery",retail,calculatedRetail,targetRetailPricePerItem:targetRetailPerItem>0?targetRetailPerItem:null,targetRetailTotal:targetRetailPerItem>0?targetRetailTotal:null,targetRetailDelta:targetRetailPerItem>0?targetRetailTotal-calculatedRetail:0,each:totalGarments?retail/totalGarments:0,cost,profit:retail-cost,margin:retail?((retail-cost)/retail)*100:0,totalGarments,lineItems:lineItemsWithAlloc,stitchCount,threadColors,placements,digitizingFees,digitizingStatus,embroideryEachDirect,embroideryDirectTotal:embroideryEachDirect*totalGarments,embroideryRetailEach,embroideryRetailSubtotal:embroiderySubtotal,embroiderySubtotal,apparelDirectCost:apparelCost,apparelRetailSubtotal:apparelRetail,threadExtraEach,namesEach,numbersEach,puffEach,handlingDirect,stitchTierUsed:rounded,qtyTierIndex:idx,manualMode,minimumWarning:totalGarments>0&&totalGarments<5,adminNotes:[stitchCount>15000?"Calculated using 15,000+ stitch formula":"",largeNumbers?"Large numbers use piece-price embroidery logic":""].filter(Boolean)};
  },[targetRetailPricePerItem,manualMode,manualName,manualColor,manualQty,manualCostEach,lineItems,styles,stitchCount,threadColors,addNames,largeNames,addNumbers,largeNumbers,puff3mm,digitizingStatus,placements]);
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
