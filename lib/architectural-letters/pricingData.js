import pricingTables from "../../data/architecturalLettersPricingTables.json";

const norm = (v) => String(v ?? "").trim().toLowerCase();
const asNumber = (v) => {
  const cleaned = String(v ?? "").replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const FILTER_KEYS = {
  productType: ["product", "type", "line", "category"],
  material: ["material", "alloy", "substrate"],
  finish: ["finish", "paint", "anod", "polish", "brush", "patina"],
  thickness: ["thick", "gauge"],
  returnDepth: ["depth", "return"],
  mounting: ["mount", "stud", "pad", "raceway", "tape", "flush"],
  lighting: ["light", "lit", "illum"],
  letterHeight: ["height", "size"],
  letterWidth: ["width"],
};

const PRICE_HEADER_TOKENS = ["price", "cost", "wholesale", "per letter", "ea", "$", "amount"];

function matchConfidence(score) {
  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "uncertain";
}


export function getArchitecturalPricingTables() {
  return pricingTables;
}

function scoreRow(row, input) {
  const entries = Object.entries(row);
  let score = 0;

  for (const [inputKey, headerTokens] of Object.entries(FILTER_KEYS)) {
    const inputValue = input[inputKey];
    if (!inputValue || inputValue === "Any") continue;

    const candidateColumns = entries.filter(([header]) => headerTokens.some((token) => norm(header).includes(token)));
    if (!candidateColumns.length) continue;

    if (candidateColumns.some(([, value]) => norm(value).includes(norm(inputValue)))) score += 1;
    else return -1;
  }

  return score;
}

function firstRowPrice(row) {
  for (const [header, value] of Object.entries(row)) {
    if (!PRICE_HEADER_TOKENS.some((token) => norm(header).includes(token))) continue;
    const numeric = asNumber(value);
    if (numeric != null && numeric > 0) return { header, value, numeric };
  }
  return null;
}

export function findMatchingRows(input) {
  const matches = [];
  const missing = [];

  for (const sheet of pricingTables.sheets) {
    const sheetMatches = sheet.records
      .map((row) => ({ row, score: scoreRow(row, input) }))
      .filter((rowMeta) => rowMeta.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((rowMeta) => rowMeta.row);

    if (sheetMatches.length) {
      matches.push({ sheetName: sheet.sheetName, rows: sheetMatches, totalMatches: sheetMatches.length });
    }
  }

  for (const key of Object.keys(FILTER_KEYS)) {
    if (!input[key] || input[key] === "Any") continue;
    const found = matches.some((m) => m.rows.some((row) => Object.values(row).some((value) => norm(value).includes(norm(input[key])))));
    if (!found) missing.push(key);
  }

  return { matches, missing };
}

function extractMatchValue(row, keys) {
  const entries = Object.entries(row);
  const found = entries.find(([header]) => keys.some((token) => norm(header).includes(token)));
  return found ? found[1] : "—";
}

export function findBestPricingMatch(input) {
  let best = null;

  for (const sheet of pricingTables.sheets) {
    sheet.records.forEach((row, idx) => {
      const score = scoreRow(row, input);
      if (score < 0) return;
      const price = firstRowPrice(row);
      const candidate = {
        score,
        sheetName: sheet.sheetName,
        rowIndex: idx + 2,
        row,
        price,
      };

      if (!best || candidate.score > best.score || (candidate.score === best.score && (candidate.price?.numeric ?? -1) > (best.price?.numeric ?? -1))) {
        best = candidate;
      }
    });
  }

  if (!best) return null;

  const matchedProductCategory = extractMatchValue(best.row, FILTER_KEYS.productType);
  const matchedMaterial = extractMatchValue(best.row, FILTER_KEYS.material);
  const matchedThicknessDepth = `${extractMatchValue(best.row, FILTER_KEYS.thickness)} / ${extractMatchValue(best.row, FILTER_KEYS.returnDepth)}`;
  const matchedSizeHeight = extractMatchValue(best.row, FILTER_KEYS.letterHeight);

  return {
    matchedProductCategory,
    matchedMaterial,
    matchedThicknessDepth,
    matchedSizeHeight,
    matchedPrice: best.price?.value ?? "—",
    sourceSheetName: best.sheetName,
    sourceRow: best.rowIndex,
    numericPrice: best.price?.numeric ?? null,
    score: best.score,
    matchConfidence: matchConfidence(best.score),
    matchedFieldsSummary: [matchedProductCategory, matchedMaterial, matchedThicknessDepth, matchedSizeHeight].join(" | "),
  };
}

export function buildArchitecturalPricingDebug(input) {
  const { matches, missing } = findMatchingRows(input);
  const bestMatch = findBestPricingMatch(input);
  return {
    loadedAt: new Date().toISOString(),
    sourceFile: pricingTables.sourceFile,
    activeTables: pricingTables.sheets.map((sheet) => ({ name: sheet.sheetName, rowCount: sheet.rowCount })),
    catalogReference: pricingTables.catalogReference,
    input,
    missingMatchFields: missing,
    matchedRows: matches,
    bestMatch,
  };
}
