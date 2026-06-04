import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  calculateApparelLineCost,
  createApparelCatalog,
  findStyle,
  findVariant,
  findVariantSize,
  getAvailableColors,
  getAvailableSizes,
  loadApparelCatalog,
  parseApparelCatalogCsv,
  sortApparelSizes,
} from "../lib/catalog/apparel-catalog.js";

const catalogPath = path.resolve(process.cwd(), "public/data/SanMar_SDL_hue.csv");
const csvText = fs.readFileSync(catalogPath, "utf8");

function toNumber(value) {
  return Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, "")) || 0;
}

function legacySimpleParse(csv) {
  const [header, ...lines] = csv.split(/\r?\n/).filter(Boolean);
  const headers = header.split(",");
  const index = Object.fromEntries(headers.map((key, ix) => [key.trim(), ix]));
  return lines.map((line) => {
    const cols = line.split(",");
    return {
      style: cols[index["STYLE#"]],
      title: cols[index.PRODUCT_TITLE],
      color: cols[index.COLOR_NAME],
      size: cols[index.SIZE],
      casePrice: toNumber(cols[index.CASE_PRICE]),
      casePriceRaw: cols[index.CASE_PRICE] || "",
      caseSize: cols[index.CASE_SIZE] || "",
    };
  }).filter((row) => row.style && row.title);
}

function legacyParseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function legacyDtfParse(csv) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  const headers = legacyParseCsvLine(lines[0]);
  const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));

  return lines.slice(1).map((line) => legacyParseCsvLine(line)).map((cols) => ({
    style: cols[headerIndex["STYLE#"]] || "",
    title: cols[headerIndex.PRODUCT_TITLE] || "",
    color: cols[headerIndex.COLOR_NAME] || "",
    size: cols[headerIndex.SIZE] || "",
    casePriceRaw: cols[headerIndex.CASE_PRICE] || "",
    casePrice: toNumber(cols[headerIndex.CASE_PRICE]),
    caseSize: cols[headerIndex.CASE_SIZE] || "",
  })).filter((row) => row.style && row.title);
}

function groupRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = `${row.style}__${row.title}`;
    if (!map.has(key)) map.set(key, { key, style: row.style, title: row.title, rows: [] });
    map.get(key).rows.push(row);
  }
  return map;
}

function legacyScreenLineCost(lineItem, styles) {
  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
  const group = styles.get(lineItem.styleKey);
  const totalQty = Object.values(lineItem.sizeQty).reduce((sum, qty) => sum + toNumber(qty), 0);
  const matchedRows = (group?.rows || []).filter((row) => row.color === lineItem.color);
  const garmentCost = sizes.reduce((sum, size) => {
    const qty = toNumber(lineItem.sizeQty[size]);
    const row = matchedRows.find((candidate) => String(candidate.size).trim().toUpperCase() === size);
    return sum + (row?.casePrice || 0) * qty;
  }, 0);
  const sizePriceBreakdown = sizes.map((size) => {
    const qty = toNumber(lineItem.sizeQty[size]);
    if (qty <= 0) return null;
    const row = matchedRows.find((candidate) => String(candidate.size).trim().toUpperCase() === size);
    return { size, qty, blankCasePrice: row?.casePrice || 0 };
  }).filter(Boolean);

  return { style: group?.style || "", title: group?.title || "", totalQty, garmentCost, sizePriceBreakdown };
}

function legacyEmbroideryLineCost(lineItem, styles) {
  const group = styles.get(lineItem.styleKey);
  const lineSizes = sortApparelSizes((group?.rows || []).map((row) => row.size));
  const totalQty = Object.values(lineItem.sizeQty).reduce((sum, qty) => sum + toNumber(qty), 0);
  const matchedRows = (group?.rows || []).filter((row) => row.color === lineItem.color);
  const garmentCost = lineSizes.reduce((sum, size) => {
    const qty = toNumber(lineItem.sizeQty[size]);
    const row = matchedRows.find((candidate) => String(candidate.size).trim().toUpperCase() === size);
    const fallback = (group?.rows || []).find((candidate) => String(candidate.size).trim().toUpperCase() === size);
    return sum + ((row?.casePrice ?? fallback?.casePrice) || 0) * qty;
  }, 0);
  const sizePriceBreakdown = lineSizes.map((size) => {
    const qty = toNumber(lineItem.sizeQty[size]);
    if (qty <= 0) return null;
    const row = matchedRows.find((candidate) => String(candidate.size).trim().toUpperCase() === size)
      || (group?.rows || []).find((candidate) => String(candidate.size).trim().toUpperCase() === size);
    return { size, qty, blankCasePrice: row?.casePrice || 0 };
  }).filter(Boolean);

  return { style: group?.style || "", title: group?.title || "", totalQty, garmentCost, sizePriceBreakdown };
}

function legacyDtfCost(lineItem, styles) {
  const group = styles.get(lineItem.styleKey);
  const matchedRows = (group?.rows || []).filter((row) => row.color === lineItem.color);
  const selectedProduct = matchedRows[0] || null;
  const baseApparelCost = selectedProduct?.casePrice || 0;
  const sizeUpcharges = {
    "2XL": 2.5,
    "3XL": 3.5,
    "4XL": 4.5,
    "5XL": 5,
  };
  const totalQty = Object.values(lineItem.sizeQty).reduce((sum, qty) => sum + toNumber(qty), 0);
  const sizeUpchargeTotal = Object.entries(sizeUpcharges).reduce((sum, [size, upcharge]) => (
    sum + toNumber(lineItem.sizeQty[size]) * upcharge
  ), 0);
  return {
    selectedProduct,
    apparelCostUsed: baseApparelCost,
    garmentCost: totalQty * baseApparelCost,
    sizeUpchargeTotal,
    totalQty,
  };
}

const legacyRows = legacySimpleParse(csvText);
const legacyDtfRows = legacyDtfParse(csvText);
const catalogRows = parseApparelCatalogCsv(csvText);
const catalog = createApparelCatalog(catalogRows);
const privateCatalog = await loadApparelCatalog({ forceReload: true });
const legacyStyles = groupRows(legacyRows);
const legacyDtfStyles = groupRows(legacyDtfRows);

assert.equal(catalogRows.length, legacyRows.length, "New parser should preserve reduced catalog row count");
assert.equal(catalog.rows.length, legacyRows.length, "Catalog should index all reduced catalog rows");
assert.equal(privateCatalog.rows.length, legacyRows.length, "Server-side private catalog loader should load the reduced catalog row count");

const screenStyle = [...legacyStyles.values()].find((style) => style.style.toLowerCase() === "2000");
assert(screenStyle, "Expected screen print parity style 2000");
const screenColors = [...new Set(screenStyle.rows.map((row) => row.color).filter(Boolean))];
const screenColor = screenColors.find((color) => color.toLowerCase() === "black") || screenColors[0];
const screenLine = {
  styleKey: screenStyle.key,
  color: screenColor,
  sizeQty: { XS: "0", S: "3", M: "5", L: "7", XL: "6", "2XL": "2", "3XL": "1", "4XL": "0", "5XL": "0", "6XL": "0" },
};
assert.deepEqual(
  calculateApparelLineCost(screenLine, catalog, { mode: "screen" }),
  { ...screenLine, ...legacyScreenLineCost(screenLine, legacyStyles) },
  "Screen printing apparel cost lookup should match legacy behavior",
);

const dtgStyle = [...legacyStyles.values()].find((style) => style.style === "BC3001");
assert(dtgStyle, "Expected DTG parity style BC3001");
const dtgColors = [...new Set(dtgStyle.rows.map((row) => row.color).filter(Boolean))].filter((color) => ["White", "Black"].includes(color));
assert.deepEqual(getAvailableColors("BC3001", catalog).filter((color) => ["White", "Black"].includes(color)), dtgColors, "DTG allowed color lookup should match legacy behavior");
for (const size of ["S", "M", "L", "XL", "2XL", "3XL"]) {
  const row = findVariantSize("BC3001", dtgColors[0], size, catalog);
  const legacyRow = dtgStyle.rows.find((candidate) => candidate.color === dtgColors[0] && String(candidate.size).trim().toUpperCase() === size);
  assert.equal(row?.casePrice || 0, legacyRow?.casePrice || 0, `DTG ${size} CASE_PRICE should match legacy behavior`);
}

const dtfStyle = [...legacyDtfStyles.values()].find((style) => style.style.toLowerCase() === "BC3001".toLowerCase());
assert(dtfStyle, "Expected DTF parity style BC3001");
const dtfColor = [...new Set(dtfStyle.rows.map((row) => row.color).filter(Boolean))].find((color) => color === "Black") || dtfStyle.rows[0].color;
const dtfLine = {
  styleKey: dtfStyle.key,
  color: dtfColor,
  sizeQty: { XS: "0", S: "4", M: "6", L: "5", XL: "3", "2XL": "2", "3XL": "1", "4XL": "1", "5XL": "0" },
};
const legacyDtf = legacyDtfCost(dtfLine, legacyDtfStyles);
const newDtf = calculateApparelLineCost(dtfLine, catalog, { mode: "dtf" });
assert.equal(newDtf.apparelCostUsed, legacyDtf.apparelCostUsed, "DTF selected CASE_PRICE should match legacy behavior");
assert.equal(newDtf.garmentCost, legacyDtf.garmentCost, "DTF apparel direct cost should match legacy behavior");
assert.equal(newDtf.sizeUpchargeTotal, legacyDtf.sizeUpchargeTotal, "DTF hardcoded size upcharges should match legacy behavior");

const embroideryStyle = [...legacyStyles.values()].find((style) => style.style.toLowerCase() === "K540".toLowerCase())
  || [...legacyStyles.values()].find((style) => style.style.toLowerCase() === "NE501".toLowerCase());
assert(embroideryStyle, "Expected embroidery parity style");
const embroideryColors = [...new Set(embroideryStyle.rows.map((row) => row.color).filter(Boolean))];
const embroideryColor = embroideryColors[0];
const embroiderySizes = sortApparelSizes(embroideryStyle.rows.map((row) => row.size));
const embroideryLine = {
  styleKey: embroideryStyle.key,
  color: embroideryColor,
  sizeQty: Object.fromEntries(embroiderySizes.map((size, index) => [size, index < 3 ? String(index + 1) : "0"])),
};
assert.deepEqual(
  calculateApparelLineCost(embroideryLine, catalog, { mode: "embroidery" }),
  { ...embroideryLine, ...legacyEmbroideryLineCost(embroideryLine, legacyStyles) },
  "Embroidery apparel cost lookup should match legacy behavior",
);

const variant = findVariant(screenStyle.style, screenColor, catalog);
assert(variant?.rows?.length > 0, "findVariant should return rows for screen print style/color");
assert.deepEqual(getAvailableSizes(screenStyle.style, screenColor, catalog), [...new Set(screenStyle.rows.filter((row) => row.color === screenColor).map((row) => row.size).filter(Boolean))], "Available sizes should match legacy style/color rows");
assert(findStyle(screenStyle.style, catalog), "findStyle should locate style by code");

console.log("Apparel catalog parity passed for screen printing, DTG, DTF, and embroidery.");
