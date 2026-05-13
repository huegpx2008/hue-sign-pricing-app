import pricingTables from "../../data/architecturalLettersPricingTables.json";

const norm = (v) => String(v ?? "").trim().toLowerCase();

const FILTER_KEYS = {
  productType: ["product", "type", "line", "category"],
  material: ["material", "alloy", "substrate"],
  finish: ["finish", "paint", "anod", "polish", "brush", "patina"],
  depth: ["depth", "thick", "gauge", "return"],
  mounting: ["mount", "stud", "pad", "raceway", "tape", "flush"],
  lighting: ["light", "lit", "illum"],
  letterHeight: ["height", "size"],
  shippingMethod: ["freight", "ship", "delivery"],
};

export function getArchitecturalPricingTables() {
  return pricingTables;
}

export function findMatchingRows(input) {
  const matches = [];
  const missing = [];

  for (const sheet of pricingTables.sheets) {
    const sheetMatches = sheet.records.filter((row) => rowMatchesInput(row, input));
    if (sheetMatches.length) {
      matches.push({ sheetName: sheet.sheetName, rows: sheetMatches.slice(0, 20), totalMatches: sheetMatches.length });
    }
  }

  for (const key of Object.keys(FILTER_KEYS)) {
    if (!input[key]) continue;
    const found = matches.some((m) => m.rows.some((row) => Object.values(row).some((value) => norm(value).includes(norm(input[key])))));
    if (!found) missing.push(key);
  }

  return { matches, missing };
}

function rowMatchesInput(row, input) {
  const entries = Object.entries(row);
  return Object.entries(FILTER_KEYS).every(([inputKey, headerTokens]) => {
    const inputValue = input[inputKey];
    if (!inputValue || inputValue === "Any") return true;
    const candidateColumns = entries.filter(([header]) => headerTokens.some((token) => norm(header).includes(token)));
    if (!candidateColumns.length) return true;
    return candidateColumns.some(([, value]) => norm(value).includes(norm(inputValue)));
  });
}

export function buildArchitecturalPricingDebug(input) {
  const { matches, missing } = findMatchingRows(input);
  return {
    loadedAt: new Date().toISOString(),
    sourceFile: pricingTables.sourceFile,
    activeTables: pricingTables.sheets.map((sheet) => ({ name: sheet.sheetName, rowCount: sheet.rowCount })),
    catalogReference: pricingTables.catalogReference,
    input,
    missingMatchFields: missing,
    matchedRows: matches,
  };
}
