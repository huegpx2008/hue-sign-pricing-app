'use client';
import {useEffect,useState,useMemo} from 'react';
export function useServerEstimate(kind,input,localResult){
 const key=JSON.stringify({kind,input});
 const [state,setState]=useState(null);
 useEffect(()=>{
  const controller=new AbortController();
  const timer=setTimeout(()=>fetch('/api/pricing/browser-estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:key,signal:controller.signal,cache:'no-store'})
   .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);return data;})
   .then(data=>setState({key,...data}))
   .catch(error=>{if(error.name!=='AbortError')setState({key,error:'Current pricing unavailable. Change an option or reload to retry.'});}),180);
  return()=>{clearTimeout(timer);controller.abort();};
 },[key]);
 return useMemo(()=>{
 if(state?.key===key&&!state.error){
  if(!state.enabled)return localResult;
  return {...localResult,...state.result,cost:0,profit:0,margin:0,materialCost:0,directCost:0,apparelDirectCost:0,dtfMaterialCost:0,costDetailsAvailable:false};
 }
 return {...localResult,retail:0,each:0,finalRetail:0,pricePerGarment:0,costDetailsAvailable:false,pricingErrors:[state?.key===key&&state.error||'Loading current pricing…']};
 },[state,key,localResult]);
}
