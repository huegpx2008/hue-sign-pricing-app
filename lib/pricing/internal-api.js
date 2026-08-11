import { timingSafeEqual } from "node:crypto";

function safeEqual(left, right) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function authorizedInternalPricingRequest(request) {
  const secret = String(process.env.HUE_PRICING_INTERNAL_API_SECRET || "").trim();
  if (secret.length < 32) return false;
  const authorization = String(request.headers.get("authorization") || "");
  if (!authorization.startsWith("Bearer ")) return false;
  return safeEqual(authorization.slice(7).trim(), secret);
}

export function internalSignCost(request, calculation) {
  if (!authorizedInternalPricingRequest(request)) return null;
  const cost = Number(calculation?.cost);
  const materialCost = Number(calculation?.materialCost);
  const shipping = Number(calculation?.shipping);
  if (![cost, materialCost, shipping].every(Number.isFinite)) return null;
  return {
    cost,
    materialCost,
    shipping,
    otherDirectCost: Math.max(0, cost - materialCost - shipping),
  };
}
