import * as formulas from './hq-sign-formulas.js';
const products = {banner:['banner','Banner'],yardSigns:['yard-sign','YardSign'],coro:['yard-sign','YardSign'],coroSigns:['custom-cut-coroplast','CustomCoroplast'],acm:['acm','Acm'],vinyl:['vinyl','Vinyl'],vehicleMagnets:['vehicle-magnet','VehicleMagnet'],meshBanner:['mesh-banner','MeshBanner'],poster:['poster','Poster'],acrylic:['acrylic','Acrylic'],foamcore:['foamcore','Foamcore'],pvc:['pvc','Pvc'],polystyrene:['polystyrene','Polystyrene'],aluminum:['aluminum','Aluminum'],businessCards:['business-card','BusinessCard'],handheld16ptPaper:['handheld-paper','HandheldPaper'],carbonless:['carbonless','Carbonless'],doorHangers:['door-hanger','DoorHanger']};
export function calculatePublishedSign(input, configuration) {
  const selected=products[input.product];
  if(!selected)return null;
  const [key,name]=selected;
  const config=configuration?.signs?.products?.[key]?.structuredPricing;
  if(!config)return null;
  const value={width:Number(input.width)||0,height:Number(input.height)||0,quantity:Number(input.qty)||1};
  const sides=double=>double?'double':'single';
  const stakeType=input.heavyStakes?'heavy-duty':input.stakes?'standard':'none';
  const scenarios={
    banner:{material:input.bannerType,polePocket:input.polePocket,rope:input.rope,windSlits:input.windSlits,rush:input.bannerRush},
    'yard-sign':{sides:sides(input.coroDouble),stakeType},
    'custom-cut-coroplast':{thickness:'4mm',sides:sides(input.coroDouble),stakeType,fluteDirection:input.coroFlute||'best',contourCut:input.coroContour,glossLaminate:input.gloss,grommets:input.grommets,rush:input.coroRush},
    acm:{material:input.acmType,contourCut:input.acmContour,roundedCorners:input.roundedCorners},
    vinyl:{material:config.materials?.find(row=>row.engineMaterial===input.vinylType)?.key || input.vinylType,contourCut:input.vinylContour,rush:input.vinylRush,gangLayout:input.gangVinyl},
    'vehicle-magnet':{style:input.vehicleMagnetMode==='custom'&&input.vehicleMagnetContour?'contour-cut':'rectangle',rush:input.vehicleMagnetRush},
    'mesh-banner':{polePocket:input.meshPolePocket,rope:input.meshRope,webbing:input.meshWebbing,grommets:input.meshGrommets,welding:input.meshWelding,rush:input.meshRush},
    poster:{rush:input.posterRush},
    acrylic:{contourCut:input.acrylicContour,roundedCorners:input.acrylicRoundedCorners,standOffs:input.acrylicStandOffs,standOffQty:Number(input.acrylicStandOffQty)||0,standOffColor:input.acrylicStandOffColor||'silver'},
    foamcore:{sides:sides(input.foamcoreDouble),contourCut:input.foamcoreContour,glossLaminate:input.foamcoreGloss,rush:input.foamcoreRush,customCut:input.foamcoreCustomCut},
    pvc:{material:input.pvcType,contourCut:input.pvcContour,rush:input.pvcRush,customCut:input.pvcCustomCut},
    polystyrene:{sides:sides(input.polystyreneDouble),contourCut:input.polystyreneContour,glossLaminate:input.polystyreneGloss,rush:input.polystyreneRush,customCut:input.polystyreneCustomCut},
    aluminum:{material:input.aluminumType,contourCut:input.acmContour,roundedCorners:input.roundedCorners},
    'business-card':{quantity:Number(input.businessCardQty)||250,sides:input.businessCardSides||'single',rush:input.businessCardRush},
    'handheld-paper':{size:config.sizes?.find(row=>row.width===Number(input.handheldPaperSize?.w)&&row.height===Number(input.handheldPaperSize?.h))?.key,sides:input.handheldPaperSides,rush:input.handheldPaperRush},
    carbonless:{quantity:Number(input.carbonlessQty)||100,formType:input.carbonlessFormType,size:input.carbonlessSize,printType:input.carbonlessPrintType,printSides:input.carbonlessPrintSides,numbering:input.carbonlessNumbering,wraparound:input.carbonlessWraparound,bookedSets:input.carbonlessBookedSets,rush:input.carbonlessRush},
    'door-hanger':{quantity:Number(input.doorHangerQty)||500,size:input.doorHangerSize,stockType:input.doorHangerType,frontInk:input.doorHangerInk,backPrinting:input.doorHangerBackPrinting,perforationCount:input.doorHangerPerforation==='No'?0:Number(String(input.doorHangerPerforation||'').match(/\d+/)?.[0]||0),shrinkWrap:input.doorHangerShrinkWrap},
  };
  const scenario={...value,...scenarios[key]};
  const scenarioConfig=key==='vinyl' ? {...config,contourPaddingInches:input.contourPadding==null?config.contourPaddingInches:Number(input.contourPadding),gangWastePercent:input.gangWastePercent==null?config.gangWastePercent:Number(input.gangWastePercent)} : key==='yard-sign' ? {...config,width:value.width||config.width,height:value.height||config.height} : config;
  let calculated=formulas['calculate'+name+'Preview'](scenarioConfig,scenario);
  if(key==='vehicle-magnet' && input.vehicleMagnetMode==='standard') {
    const materialCost=(config.standardPresetCosts[input.vehicleMagnetPreset] ?? config.standardPresetCosts['18x12'])*scenario.quantity;
    const shippingCost=scenario.quantity>=config.standardBulkQuantity ? config.bulkShippingCost : Math.ceil(scenario.quantity/config.standardShippingGroupSize)*config.standardShippingCost;
    const retail=materialCost/(1-config.marginPercent/100)*(input.vehicleMagnetRush?config.rushMultiplier:1)+shippingCost;
    calculated={retail,each:retail/scenario.quantity,directCost:materialCost+shippingCost,materialCost,shippingCost,calculationBasis:'Standard magnet preset cost, margin and grouped freight'};
  }
  if(key==='yard-sign') {
    const extras=configuration.signs.products['custom-cut-coroplast'].structuredPricing;
    const quantity=scenario.quantity;
    const tier=config.quantityTiers.reduce((selected,row)=>quantity>=row.minimumQuantity?row:selected,config.quantityTiers[0]);
    let tierPrice=(input.coroDouble?tier.doubleSidedEach:tier.singleSidedEach)*quantity*(value.width===18&&value.height===12?0.5:1);
    tierPrice+=(input.heavyStakes?quantity*config.heavyStakeUpchargeEach:0)+(input.grommets?quantity*extras.grommetEach+extras.grommetSetup:0)+(input.gloss?quantity*extras.glossEach:0);
    if(input.coroRush)tierPrice*=extras.rushMultiplier;
    const marginPrice=calculated.materialCost/(1-config.marginPercent/100)+calculated.shippingCost;
    const retail=Math.max(tierPrice,marginPrice)*(input.coroContour?extras.contourMultiplier:1)+(input.stakes?quantity*config.standardStakeRetailEach:0);
    calculated={...calculated,retail,each:retail/quantity,directCost:calculated.materialCost+calculated.shippingCost+(input.stakes?quantity*config.standardStakeCostEach:0)};
  }
  const fees=(input.useDesignFee?Number(input.designFee)||0:0)+(input.useSetupFee?Number(input.setupFee)||0:0)+(Number(input.delivery)||0);
  const retail=(calculated.retail+fees)*(Number(input.multiplier)||1);
  return {...calculated.breakdown,retail,each:retail/scenario.quantity,cost:calculated.directCost,materialCost:calculated.materialCost,shipping:calculated.shippingCost,profit:retail-calculated.directCost,margin:retail?(retail-calculated.directCost)/retail*100:0,basePrice:calculated.retail,calculationBasis:calculated.calculationBasis};
}
