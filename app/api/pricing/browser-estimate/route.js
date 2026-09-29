import {bridgeEnabled,loadPublishedPricing,preparePricingCatalog} from '../../../../lib/pricing/hq-bridge.js';
import {loadApparelCatalog} from '../../../../lib/catalog/apparel-catalog.js';
import {calculateDtfPricing} from '../../../../lib/pricing/dtf.js';
import {calculateEmbroideryPricing} from '../../../../lib/pricing/embroidery.js';
import {calculateScreenprintPricing} from '../../../../lib/pricing/screenprint.js';
import {calculateGeneralSignPricing} from '../../../../lib/pricing/general-signs.js';
function customerSafe(value) {
 if(Array.isArray(value))return value.map(customerSafe);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!/calculationBasis|optimization|cost|profit|margin|supplier|markup|direct|caseprice|threadExtraEach|namesEach|numbersEach|puffEach/i.test(key)).map(([key,entry])=>[key,customerSafe(entry)]));
 return value;
}
export async function POST(request){
 if(!bridgeEnabled())return Response.json({enabled:false});
 try{
  const raw=await request.text();if(raw.length>50000)return Response.json({error:'Request too large'},{status:413});
  const {kind,input}=JSON.parse(raw);
  if(!input||typeof input!=='object'||!['dtf','screenprint','embroidery','general'].includes(kind))return Response.json({error:'Invalid calculator'},{status:400});
  const quantities=kind==='general'?[input.qty,input.businessCardQty,input.carbonlessQty,input.doorHangerQty]:kind==='dtf'?[...Object.values(input.apparel?.sizes||{}),input.dtfOnlyQty,input.byoaTransferQty]:[...(input.lineItems||[]).flatMap(row=>Object.values(row.sizes||row.sizeQty||{})),input.manualQty];
  if(quantities.some(value=>value!=null&&(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>10000)))return Response.json({error:'Quantity must be between 0 and 10000'},{status:400});
  if(kind!=='general' && quantities.reduce((sum,value)=>sum+(Number(value)||0),0)>10000)return Response.json({error:'Too many garments'},{status:400});
  if((input.lineItems?.length??0)>20||(input.printLocations?.length??0)>10||(input.locations?.length??0)>10)return Response.json({error:'Too many lines or locations'},{status:400});
  let result;
  if(kind==='general'){
    const release=await loadPublishedPricing();
    result=calculateGeneralSignPricing(input,release.configuration);
  }else{
    const lines=(input.lineItems||[]).map(row=>({...row,style:row.style||String(row.styleKey||'').split('__')[0],sizes:row.sizes||row.sizeQty||{}}));
    const apparel=input.apparel?{...input.apparel,style:input.apparel.style||String(input.apparel.styleKey||'').split('__')[0]}:undefined;
    const catalog=await preparePricingCatalog(await loadApparelCatalog(),{...input,lineItems:kind==='dtf'?undefined:lines,apparel:input.bringYourOwnApparel||input.dtfMode==='dtfOnly'?undefined:apparel});
    result=kind==='dtf'?calculateDtfPricing(input,catalog):kind==='embroidery'?calculateEmbroideryPricing(input,catalog):calculateScreenprintPricing({...input,lineItems:lines},catalog);
    if(kind==='screenprint') {
      const markup=catalog.pricing.screenprint.productMarkupMultiplier;
      const channel=result.channelMultiplier??1;
      const printEach=result.totalGarments?result.printChargeSubtotal/result.totalGarments:0;
      result.lineItems=result.lineItems.map((row,index)=>({...row,id:input.lineItems[index]?.id,sizeQty:input.lineItems[index]?.sizeQty||input.lineItems[index]?.sizes,
        retailPerShirt:(row.totalQty?row.garmentCost/row.totalQty*markup*channel:0)+printEach,
        finalRetailSubtotal:row.garmentCost*markup*channel+row.totalQty*printEach,printChargePerShirt:printEach,
        sizePriceBreakdown:row.sizePriceBreakdown.map(tier=>({...tier,garmentPriceEach:tier.blankCasePrice*markup*channel}))
      }));
    }
  }
  if(!Number.isFinite(result.retail)||result.retail<0)throw new Error('Invalid calculated price');
  return Response.json({enabled:true,result:customerSafe(result)},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Current pricing is unavailable. Please retry.'},{status:503});}
}
