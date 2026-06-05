import assert from "node:assert/strict";
import { POST } from "../app/api/pricing/embroidery/route.js";
import { findStyle, loadApparelCatalog, sortApparelSizes } from "../lib/catalog/apparel-catalog.js";
import { calculateEmbroideryPricing } from "../lib/pricing/embroidery.js";

const tolerance = 1e-9;

async function postJson(body) {
  const request = new Request("http://localhost/api/pricing/embroidery", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const response = await POST(request);
  return {
    status: response.status,
    json: await response.json(),
  };
}

function normalizeSizeMap(sizes) {
  return Object.fromEntries(Object.entries(sizes || {}).map(([size, quantity]) => [
    String(size).trim().toUpperCase(),
    Number(quantity),
  ]));
}

function engineInputFromApi(body, catalog) {
  const firstLocation = body.locations[0];
  return {
    lineItems: body.lineItems.map((item, index) => {
      const style = findStyle(item.style, catalog);
      assert(style, `Expected style ${item.style}`);
      const sizes = normalizeSizeMap(item.sizes);
      const styleSizes = sortApparelSizes(style.rows.map((row) => row.size));
      return {
        id: `api-${index}`,
        style: String(item.style).trim(),
        styleKey: style.key,
        color: String(item.color).trim(),
        sizeQty: Object.fromEntries(styleSizes.map((size) => [size, String(sizes[size] || 0)])),
      };
    }),
    placements: [String(firstLocation.placement).trim()],
    stitchCount: Number(firstLocation.stitchCount),
    threadColors: Number(firstLocation.threadColors),
    puff3mm: firstLocation.puff3mm === true,
    digitizingStatus: body.digitizingRequired === true ? "New Logo / Needs Digitizing" : "Reorder / Digitized File On Hand",
    addNames: body.names?.enabled === true,
    largeNames: body.names?.large === true,
    addNumbers: body.numbers?.enabled === true,
    largeNumbers: body.numbers?.large === true,
  };
}

const requestBodies = [
  {
    lineItems: [
      {
        style: "K540",
        color: "Black",
        sizes: { S: 6, M: 12, L: 12, XL: 6, "2XL": 2 },
      },
    ],
    locations: [{ placement: "Left Chest", stitchCount: 8000, threadColors: 3, puff3mm: false }],
    digitizingRequired: true,
    names: { enabled: false, large: false },
    numbers: { enabled: false, large: false },
  },
  {
    lineItems: [
      {
        style: "K540",
        color: "Black",
        sizes: { S: 2, M: 2, L: 1 },
      },
    ],
    locations: [{ placement: "Full Back", stitchCount: 17250, threadColors: 4, puff3mm: true }],
    digitizingRequired: false,
    names: { enabled: true, large: true },
    numbers: { enabled: true, large: true },
  },
  {
    lineItems: [
      {
        style: "NE501",
        color: "Black",
        sizes: { OSFA: 24 },
      },
    ],
    locations: [{ placement: "Hat Front", stitchCount: 5000, threadColors: 2, puff3mm: false }],
    digitizingRequired: true,
    names: { enabled: false, large: false },
    numbers: { enabled: false, large: false },
  },
];

const catalog = await loadApparelCatalog({ forceReload: true });

for (const [index, body] of requestBodies.entries()) {
  const response = await postJson(body);
  assert.equal(response.status, 200, `Case ${index + 1}: expected status 200, got ${response.status}`);
  assert.equal(response.json.ok, true, `Case ${index + 1}: expected ok=true`);

  const expected = calculateEmbroideryPricing(engineInputFromApi(body, catalog), catalog);
  assert(Math.abs(response.json.price.retail - expected.retail) <= tolerance, `Case ${index + 1}: retail does not match embroidery engine`);
  assert(Math.abs(response.json.price.each - expected.each) <= tolerance, `Case ${index + 1}: each does not match embroidery engine`);
}

console.log("Embroidery pricing API parity passed for 3 cases.");
