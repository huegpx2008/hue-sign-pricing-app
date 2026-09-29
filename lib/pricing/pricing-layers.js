const categoryByProduct={screenprint:'apparel',dtf:'apparel',embroidery:'apparel',banner:'banners',meshBanner:'banners',coro:'coro',yardSigns:'coro',coroSigns:'coro',acm:'rigid-signs',aluminum:'rigid-signs',acrylic:'rigid-signs',foamcore:'rigid-signs',pvc:'rigid-signs',polystyrene:'rigid-signs',vinyl:'decals',reflective:'decals',footprints:'decals',vehicleMagnets:'magnets',poster:'print-products',businessCards:'print-products',handheld16ptPaper:'print-products',carbonless:'print-products',doorHangers:'print-products'};
const sellingFields=new Set(['retail','each','finalRetail','pricePerGarment','priceEach','finalRetailSubtotal','retailPerShirt','pricePerPrint','subtotal','setupFee','apparelRetailSubtotal','printChargeSubtotal','averagePricePerShirt','garmentRetail','markedUpGarmentPrice','garmentPriceEach','embroideryRetailEach','embroideryRetailSubtotal','embroiderySubtotal','digitizingFees','calculatedRetail','dtfRetailSubtotal','sleeveRetailAddOnTotal','byoaRetailFee','basePrice','shopPrice','costMarginPrice','tierPrice','printChargeAllocated','setupFeeAllocated','sharedRetailEach','printChargePerShirt']);
export function channelMultiplier(configuration,product){
 const rows=(configuration?.channelAdjustments||[]).filter(row=>row.channel==='hq_website');
 return rows.filter(row=>row.scope==='category'&&row.adjustment_key===(categoryByProduct[product]||'other') || row.scope==='product'&&row.adjustment_key===product).reduce((factor,row)=>factor*Number(row.percentage)/100,1);
}
export function applySellingAdjustment(result,configuration,product){
 const factor=channelMultiplier(configuration,product);
 if(factor===1)return result;
 const visit=value=>Array.isArray(value)?value.map(visit):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,entry])=>[key,typeof entry==='number'&&sellingFields.has(key)?entry*factor:visit(entry)])):value;
 const updated=visit(result);
 if(Number.isFinite(updated.cost)){updated.profit=updated.retail-updated.cost;updated.margin=updated.retail?updated.profit/updated.retail*100:0;}
 return {...updated,channelMultiplier:factor};
}
export function supplierMultiplier(configuration,category){
 const rows=(configuration?.supplierAdjustments||[]).filter(row=>row.supplier==='sanmar');
 const row=rows.find(row=>row.category===category)||rows.find(row=>row.category==='Other Apparel');
 return row?Number(row.percentage)/100:1;
}
