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

function explainFlatCutMetalNoMatch(input) {
  const sheet = getSheet(TARGET_SHEETS.flatCut);
  if (!sheet) return { reasonNoMatch: "Flat Cut Metal sheet not loaded.", mismatchDetails: [] };
  const validHeights = sheet.records.map((row) => asNumber(row.Size)).filter((value) => value != null);
  const valid = {
    productType: ["Flat Cut Metal"],
    material: ["Aluminum", "Stainless Steel", "Brass", "Bronze"],
    finish: ["Raw", "Brushed", "Polished", "Painted", "Anodized", "Patina"],
    thickness: ['1/8"', '1/4"'],
    mounting: ["Stud Mount", "Pad Mount", "Flush Mount", "Double-Face Tape"],
    lighting: ["Non-Lit"],
    letterHeight: validHeights,
  };
  const fieldLabels = { productType: "Product Type", material: "Material", finish: "Finish", thickness: "Thickness", mounting: "Mounting", lighting: "Lighting", letterHeight: "Letter Height" };
  const mismatchDetails = Object.entries(valid).flatMap(([field, values]) => {
    const selected = field === "letterHeight" ? Number(input[field]) : input[field];
    return values.includes(selected) ? [] : [{ field, label: fieldLabels[field], selected: input[field], validOptions: values }];
  });
  const firstMismatch = mismatchDetails[0];
  return {
    mismatchDetails,
    reasonNoMatch: firstMismatch
      ? `No pricing match found. Mismatch on ${firstMismatch.label}: selected "${firstMismatch.selected}" is not available.`
      : "No pricing match found for selected options.",
  };
}

export function buildArchitecturalPricingDebug(input) {
  let bestMatch = null;
  let mismatchDetails = [];
  if (norm(input.productType) === "flat cut metal") {
    bestMatch = findFlatCutMetalMatch(input);
    if (!bestMatch) {
      const mismatch = explainFlatCutMetalNoMatch(input);
      mismatchDetails = mismatch.mismatchDetails;
      return {
        loadedAt: new Date().toISOString(),
        sourceFile: pricingTables.sourceFile,
        activeTables: Object.values(TARGET_SHEETS).map((name) => {
          const s = getSheet(name);
          return { name, rowCount: s?.rowCount ?? 0 };
        }),
        input,
        bestMatch,
        warning: null,
        mismatchDetails,
        reasonNoMatch: mismatch.reasonNoMatch,
      };
    }
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
    mismatchDetails,
    reasonNoMatch: bestMatch ? null : "No pricing row matched selected product/attributes.",
  };
}
