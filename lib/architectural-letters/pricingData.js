import pricingTables from "../../data/architecturalLettersPricingTables.json";

const norm = (v) => String(v ?? "").trim().toLowerCase();
const asNumber = (v) => {
  const cleaned = String(v ?? "").replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const TARGET_SHEETS = {
  flatCut: "CY26 US - Flat Cut Metal",
  fabAluminum: "CY26 US Fab Non-Lit Aluminum",
  fabStainless: "CY26 US Fab Non-Lit Stainless",
  castMetal: "CY26 US Cast Metal",
};

function getSheet(name) {
  return pricingTables.sheets.find((s) => s.sheetName === name);
}

function nearestBySize(rows, sizeValue) {
  const target = Number(sizeValue);
  const withSize = rows
    .map((row) => ({ row, size: asNumber(row.Size ?? row.size ?? row["1"] ?? row["2"] ?? "") }))
    .filter((x) => x.size != null);
  if (!withSize.length) return null;
  const exact = withSize.find((x) => x.size === target);
  if (exact) return { ...exact, isFallback: false };
  withSize.sort((a, b) => Math.abs(a.size - target) - Math.abs(b.size - target));
  return { ...withSize[0], isFallback: true };
}

function findFlatCutMetalMatch(input) {
  const sheet = getSheet(TARGET_SHEETS.flatCut);
  if (!sheet) return null;
  const picked = nearestBySize(sheet.records, input.letterHeight);
  if (!picked) return null;

  const finishToColumn = {
    raw: "A",
    brushed: "A",
    painted: "A",
    anodized: "B",
    patina: "C",
    polished: "D",
  };
  const priceCol = finishToColumn[norm(input.finish)] || "A";
  const priceValue = picked.row[priceCol];
  const numeric = asNumber(priceValue);
  return {
    sourceSheetName: sheet.sheetName,
    sourceRow: sheet.records.indexOf(picked.row) + 2,
    matchedRow: { Size: picked.row.Size, A: picked.row.A, B: picked.row.B, C: picked.row.C, D: picked.row.D, E: picked.row.E },
    matchedColumn: priceCol,
    matchedPrice: priceValue ?? "—",
    numericPrice: numeric,
    usedFallback: picked.isFallback,
    fallbackReason: picked.isFallback ? "Using closest available pricing match" : null,
    compared: {
      productType: { selected: input.productType, spreadsheet: "Flat Cut Metal" },
      material: { selected: input.material, spreadsheet: "FC Aluminum Letters" },
      finish: { selected: input.finish, spreadsheet: `${input.finish} -> column ${priceCol}` },
      thickness: { selected: input.thickness, spreadsheet: "1/8\" / 1/4\" matrix" },
      mounting: { selected: input.mounting, spreadsheet: "Not priced in table" },
      lighting: { selected: input.lighting, spreadsheet: "Non-Lit" },
      letterHeight: { selected: String(input.letterHeight), spreadsheet: String(picked.row.Size) },
    },
  };
}

export function buildArchitecturalPricingDebug(input) {
  let bestMatch = null;
  if (norm(input.productType) === "flat cut metal") {
    bestMatch = findFlatCutMetalMatch(input);
  }

  const warning = bestMatch?.usedFallback ? "Using closest available pricing match" : null;
  return {
    loadedAt: new Date().toISOString(),
    sourceFile: pricingTables.sourceFile,
    activeTables: Object.values(TARGET_SHEETS).map((name) => {
      const s = getSheet(name);
      return { name, rowCount: s?.rowCount ?? 0 };
    }),
    input,
    bestMatch,
    warning,
    reasonNoMatch: bestMatch ? null : "No pricing row matched selected product/attributes.",
  };
}
