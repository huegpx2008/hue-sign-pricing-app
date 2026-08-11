import { POST as postAcm } from "../app/api/pricing/acm/route.js";
import { POST as postBanner } from "../app/api/pricing/banner/route.js";
import { POST as postYardSign } from "../app/api/pricing/yard-sign/route.js";

const secret = "test-internal-pricing-secret-that-is-long-enough";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function invoke(post, path, body, authorization) {
  const headers = { "content-type": "application/json" };
  if (authorization) headers.authorization = authorization;
  const response = await post(new Request(`http://localhost${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }));
  return { status: response.status, json: await response.json() };
}

process.env.HUE_PRICING_INTERNAL_API_SECRET = secret;

const cases = [
  [postAcm, "/api/pricing/acm", { width: 36, height: 30, quantity: 1, thickness: "3mm", sides: "single", contourCut: false, glossLaminate: false, rush: false }],
  [postBanner, "/api/pricing/banner", { width: 72, height: 36, quantity: 1, material: "13-single", polePocket: false, rope: false, windSlits: false, rush: false }],
  [postYardSign, "/api/pricing/yard-sign", { quantity: 24, sides: "double", stakeType: "standard" }],
];

for (const [post, path, body] of cases) {
  const publicResult = await invoke(post, path, body);
  assert(publicResult.status === 200, `${path} public request failed`);
  assert(publicResult.json.internalCost === undefined, `${path} leaked internal cost publicly`);

  const wrongSecret = await invoke(post, path, body, "Bearer wrong-secret");
  assert(wrongSecret.status === 200, `${path} wrong-secret request failed`);
  assert(wrongSecret.json.internalCost === undefined, `${path} accepted the wrong secret`);

  const internalResult = await invoke(post, path, body, `Bearer ${secret}`);
  assert(internalResult.status === 200, `${path} internal request failed`);
  assert(Number.isFinite(internalResult.json.internalCost?.cost), `${path} omitted internal total cost`);
  assert(Number.isFinite(internalResult.json.internalCost?.materialCost), `${path} omitted internal material cost`);
  assert(Number.isFinite(internalResult.json.internalCost?.shipping), `${path} omitted internal shipping cost`);
  assert(Number.isFinite(internalResult.json.internalCost?.otherDirectCost), `${path} omitted other direct sign cost`);
  assert(Math.abs(internalResult.json.internalCost.cost - (internalResult.json.internalCost.materialCost + internalResult.json.internalCost.shipping + internalResult.json.internalCost.otherDirectCost)) < 1e-9, `${path} internal cost components do not reconcile`);
}

console.log("Protected internal sign-cost API contract passed.");
