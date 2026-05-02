import React, { useMemo, useState } from "react"; import { Card, CardContent } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { Label } from "@/components/ui/label"; import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; import { Switch } from "@/components/ui/switch"; import { Calculator, DollarSign, FileText, Settings, Truck, Wrench } from "lucide-react";

const PRODUCTS = { coroplast: { name: "Coroplast Yard Sign", description: "Yard signs, campaign signs, event signs, open house signs.", materialRate: 1.15, printRate: 2.35, minPrice: 18, defaultLaborMinutes: 8 }, realEstate: { name: "Real Estate Sign Panel", description: "Larger outdoor panels for real estate frames and property signs.", materialRate: 3.25, printRate: 3.75, minPrice: 65, defaultLaborMinutes: 18 }, rider: { name: "Real Estate Rider", description: "Small add-on riders such as SOLD, Coming Soon, Open House, etc.", materialRate: 2.1, printRate: 2.95, minPrice: 25, defaultLaborMinutes: 10 }, banner: { name: "Vinyl Banner", description: "Indoor/outdoor vinyl banners with hems and grommets.", materialRate: 1.85, printRate: 3.65, minPrice: 45, defaultLaborMinutes: 15 }, meshBanner: { name: "Mesh Banner", description: "Wind-friendly banners for fences, fields, and outdoor events.", materialRate: 2.25, printRate: 4.1, minPrice: 65, defaultLaborMinutes: 20 }, aluminum: { name: "Aluminum Sign", description: "Metal signs for parking, directional, safety, and outdoor use.", materialRate: 4.5, printRate: 3.95, minPrice: 55, defaultLaborMinutes: 20 }, acm: { name: "ACM / Dibond Sign", description: "Premium rigid outdoor panels for business signs and long-term use.", materialRate: 5.85, printRate: 4.25, minPrice: 85, defaultLaborMinutes: 25 }, pvc: { name: "PVC Sign", description: "Rigid indoor or short-term outdoor sign boards.", materialRate: 3.45, printRate: 3.45, minPrice: 55, defaultLaborMinutes: 18 }, foamBoard: { name: "Foam Board Sign", description: "Lightweight indoor signs for presentations, events, and displays.", materialRate: 2.4, printRate: 3.1, minPrice: 40, defaultLaborMinutes: 14 }, decal: { name: "Cut Vinyl / Decal", description: "Simple cut vinyl lettering, decals, and small graphics.", materialRate: 1.5, printRate: 2.85, minPrice: 25, defaultLaborMinutes: 12 }, printedVinyl: { name: "Printed Vinyl Decal", description: "Printed decals, laminated stickers, window decals, and contour-cut graphics.", materialRate: 2.1, printRate: 4.25, minPrice: 35, defaultLaborMinutes: 16 }, windowPerf: { name: "Window Perf", description: "Perforated window graphics for storefronts and vehicle windows.", materialRate: 3.25, printRate: 4.75, minPrice: 65, defaultLaborMinutes: 22 }, magnet: { name: "Vehicle Magnet", description: "Magnetic vehicle door signs and removable graphics.", materialRate: 4.2, printRate: 3.85, minPrice: 55, defaultLaborMinutes: 18 }, bannerStand: { name: "Retractable Banner Stand", description: "Pull-up banner with hardware included.", materialRate: 5.25, printRate: 4.75, minPrice: 145, defaultLaborMinutes: 25 }, };

function money(value) { return Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" }); }

export default function SignPricingApp() { const [productKey, setProductKey] = useState("coroplast"); const [width, setWidth] = useState(24); const [height, setHeight] = useState(18); const [quantity, setQuantity] = useState(10); const [doubleSided, setDoubleSided] = useState(false); const [targetMargin, setTargetMargin] = useState(60); const [shopRate, setShopRate] = useState(65); const [laborMinutes, setLaborMinutes] = useState(PRODUCTS.coroplast.defaultLaborMinutes); const [designFee, setDesignFee] = useState(25); const [setupFee, setSetupFee] = useState(10); const [hardwareFee, setHardwareFee] = useState(0); const [deliveryFee, setDeliveryFee] = useState(0); const [rushFee, setRushFee] = useState(0);

const product = PRODUCTS[productKey];

const calc = useMemo(() => { const qty = Math.max(Number(quantity) || 1, 1); const sqFtEach = ((Number(width) || 0) * (Number(height) || 0)) / 144; const sideMultiplier = doubleSided ? 2 : 1; const totalSqFt = sqFtEach * qty * sideMultiplier; const materialCost = totalSqFt * product.materialRate; const printCost = totalSqFt * product.printRate; const laborCost = ((Number(laborMinutes) || 0) / 60) * (Number(shopRate) || 0); const directCost = materialCost + printCost + laborCost + Number(hardwareFee || 0) + Number(deliveryFee || 0); const marginDecimal = Math.min(Number(targetMargin) || 0, 95) / 100; const retailBeforeFees = directCost / (1 - marginDecimal); const retail = Math.max(retailBeforeFees + Number(designFee || 0) + Number(setupFee || 0) + Number(rushFee || 0), product.minPrice * qty); const profit = retail - directCost; const actualMargin = retail > 0 ? (profit / retail) * 100 : 0; const priceEach = retail / qty; return { sqFtEach, totalSqFt, materialCost, printCost, laborCost, directCost, retail, profit, actualMargin, priceEach }; }, [width, height, quantity, doubleSided, product, laborMinutes, shopRate, hardwareFee, deliveryFee, targetMargin, designFee, setupFee, rushFee]);

function handleProductChange(value) { setProductKey(value); setLaborMinutes(PRODUCTS[value].defaultLaborMinutes); }

return ( <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900"> <div className="mx-auto max-w-6xl space-y-6"> <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"> <div> <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"> <Calculator className="h-4 w-4" /> Demo Pricing Mode </div> <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Hue Graphics Sign Pricing App</h1> <p className="mt-2 max-w-2xl text-slate-600">Random placeholder prices are loaded so we can test the flow first. Real pricing can be swapped in later.</p> </div> <Button className="rounded-2xl px-6">Save Quote</Button> </div>

<div className="grid gap-6 lg:grid-cols-[1.35fr_.9fr]">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5 md:p-6">
          <Tabs defaultValue="quote" className="space-y-5">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl">
              <TabsTrigger value="quote">Quote</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="quote" className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Sign Type</Label>
                  <Select value={productKey} onValueChange={handleProductChange}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRODUCTS).map(([key, item]) => <SelectItem key={key} value={key}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500">{product.description}</p>
                </div>
                <div className="space-y-2"><Label>Quantity</Label><Input className="rounded-xl" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
                <div className="space-y-2"><Label>Width Inches</Label><Input className="rounded-xl" type="number" value={width} onChange={(e) => setWidth(e.target.value)} /></div>
                <div className="space-y-2"><Label>Height Inches</Label><Input className="rounded-xl" type="number" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
                <div className="flex items-center justify-between rounded-2xl border bg-white p-4 md:col-span-2">
                  <div><p className="font-semibold">Double-Sided</p><p className="text-sm text-slate-500">Adds print/material coverage for both sides.</p></div>
                  <Switch checked={doubleSided} onCheckedChange={setDoubleSided} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fees" className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Design Fee</Label><Input className="rounded-xl" type="number" value={designFee} onChange={(e) => setDesignFee(e.target.value)} /></div>
                <div className="space-y-2"><Label>Setup Fee</Label><Input className="rounded-xl" type="number" value={setupFee} onChange={(e) => setSetupFee(e.target.value)} /></div>
                <div className="space-y-2"><Label>Hardware / Stakes / Grommets</Label><Input className="rounded-xl" type="number" value={hardwareFee} onChange={(e) => setHardwareFee(e.target.value)} /></div>
                <div className="space-y-2"><Label>Delivery / Install</Label><Input className="rounded-xl" type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Rush Fee</Label><Input className="rounded-xl" type="number" value={rushFee} onChange={(e) => setRushFee(e.target.value)} /></div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Target Profit Margin %</Label><Input className="rounded-xl" type="number" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} /></div>
                <div className="space-y-2"><Label>Shop Labor Rate / Hour</Label><Input className="rounded-xl" type="number" value={shopRate} onChange={(e) => setShopRate(e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Estimated Labor Minutes</Label><Input className="rounded-xl" type="number" value={laborMinutes} onChange={(e) => setLaborMinutes(e.target.value)} /></div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-2xl bg-slate-950 text-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-300">Suggested Retail</p><p className="mt-1 text-4xl font-bold">{money(calc.retail)}</p></div>
              <div className="rounded-2xl bg-white/10 p-3"><DollarSign className="h-7 w-7" /></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-slate-300">Price Each</p><p className="text-xl font-semibold">{money(calc.priceEach)}</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-slate-300">Profit</p><p className="text-xl font-semibold">{money(calc.profit)}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2 font-semibold"><FileText className="h-5 w-5" /> Quote Breakdown</div>
            <div className="space-y-3 text-sm">
              <Row label="Selected Product" value={product.name} />
              <Row label="Size Each" value={`${Number(width)}\" x ${Number(height)}\"`} />
              <Row label="Sq Ft Each" value={calc.sqFtEach.toFixed(2)} />
              <Row label="Total Print Sq Ft" value={calc.totalSqFt.toFixed(2)} />
              <Row label="Material Cost" value={money(calc.materialCost)} />
              <Row label="Print Cost" value={money(calc.printCost)} />
              <Row label="Labor Cost" value={money(calc.laborCost)} />
              <Row label="Direct Cost" value={money(calc.directCost)} />
              <Row label="Actual Margin" value={`${calc.actualMargin.toFixed(1)}%`} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <MiniCard icon={<Wrench className="h-5 w-5" />} label="Hardware" value={money(Number(hardwareFee))} />
          <MiniCard icon={<Truck className="h-5 w-5" />} label="Delivery" value={money(Number(deliveryFee))} />
          <MiniCard icon={<Settings className="h-5 w-5" />} label="Setup" value={money(Number(setupFee))} />
          <MiniCard icon={<FileText className="h-5 w-5" />} label="Design" value={money(Number(designFee))} />
        </div>
      </div>
    </div>
  </div>
</div>

); }

function Row({ label, value }) { return <div className="flex items-center justify-between border-b pb-2 last:border-0"><span className="text-slate-500">{label}</span><span className="font-semibold text-right">{value}</span></div>; }

function MiniCard({ icon, label, value }) { return <Card className="rounded-2xl shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm">{label}</span></div><p className="mt-2 text-xl font-bold">{value}</p></CardContent></Card>; }
