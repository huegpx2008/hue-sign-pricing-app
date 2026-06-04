const DEFAULT_CATALOG_PATH = "/data/SanMar_SDL_hue.csv";
const SERVER_CATALOG_PATH = "data/private/apparel/SanMar_SDL_hue.csv";
const DEFAULT_SCREEN_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
const DTF_SIZE_UPCHARGES = {
  "2XL": 2.5,
  "3XL": 3.5,
  "4XL": 4.5,
  "5XL": 5,
};

let loadedCatalog = null;

function toNumber(value) {
  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeSize(value) {
  return normalizeText(value).toUpperCase();
}

function parseCsvLine(line) {
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

export function normalizeSanMarRow(row) {
  const style = normalizeText(row["STYLE#"] ?? row.style);
  const title = normalizeText(row.PRODUCT_TITLE ?? row.title);
  const color = normalizeText(row.COLOR_NAME ?? row.color);
  const size = normalizeText(row.SIZE ?? row.size);
  const casePriceRaw = normalizeText(row.CASE_PRICE ?? row.casePriceRaw ?? row.casePrice);
  const caseSize = normalizeText(row.CASE_SIZE ?? row.caseSize);

  return {
    vendor: "SanMar",
    style,
    title,
    productName: title,
    brand: normalizeText(row.MILL ?? row.brand),
    category: normalizeText(row.CATEGORY_NAME ?? row.category),
    color,
    size,
    normalizedSize: normalizeSize(size),
    casePriceRaw,
    casePrice: toNumber(casePriceRaw),
    unitCost: toNumber(casePriceRaw),
    caseSize,
    piecePrice: toNumber(row.PIECE_PRICE ?? row.piecePrice),
    dozensPrice: toNumber(row.DOZENS_PRICE ?? row.dozensPrice),
    pieceWeight: toNumber(row.PIECE_WEIGHT ?? row.pieceWeight),
    priceGroup: normalizeText(row.PRICE_GROUP ?? row.priceGroup),
    inventoryKey: normalizeText(row.INVENTORY_KEY ?? row.inventoryKey),
    sizeIndex: normalizeText(row.SIZE_INDEX ?? row.sizeIndex),
    productStatus: normalizeText(row.PRODUCT_STATUS ?? row.productStatus),
    thumbnailImage: normalizeText(row.THUMBNAIL_IMAGE ?? row.thumbnailImage),
    productImage: normalizeText(row.PRODUCT_IMAGE ?? row.productImage),
    colorSwatchImage: normalizeText(row.COLOR_SWATCH_IMAGE ?? row.colorSwatchImage),
    colorProductImage: normalizeText(row.COLOR_PRODUCT_IMAGE ?? row.colorProductImage),
    frontModelImageUrl: normalizeText(row.FRONT_MODEL_IMAGE_URL ?? row.frontModelImageUrl),
    backModelImageUrl: normalizeText(row.BACK_MODEL_IMAGE_URL ?? row.backModelImageUrl),
    frontFlatImageUrl: normalizeText(row.FRONT_FLAT_IMAGE_URL ?? row.frontFlatImageUrl),
    backFlatImageUrl: normalizeText(row.BACK_FLAT_IMAGE_URL ?? row.backFlatImageUrl),
  };
}

export function parseApparelCatalogCsv(csvText) {
  const lines = String(csvText || "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const rawRow = Object.fromEntries(headers.map((header, index) => [header.trim(), cells[index] ?? ""]));
    return normalizeSanMarRow(rawRow);
  }).filter((row) => row.style && row.title);
}

export function createApparelCatalog(rows = []) {
  const normalizedRows = rows.map((row) => (
    row && row.vendor === "SanMar" ? row : normalizeSanMarRow(row)
  )).filter((row) => row.style && row.title);

  const stylesByKey = new Map();
  const stylesByCode = new Map();
  const variantsByKey = new Map();
  const variantSizesByKey = new Map();

  for (const row of normalizedRows) {
    const styleKey = `${row.style}__${row.title}`;
    if (!stylesByKey.has(styleKey)) {
      const group = { key: styleKey, style: row.style, title: row.title, productName: row.productName, rows: [] };
      stylesByKey.set(styleKey, group);
      const styleCodeKey = row.style.toLowerCase();
      if (!stylesByCode.has(styleCodeKey)) stylesByCode.set(styleCodeKey, []);
      stylesByCode.get(styleCodeKey).push(group);
    }
    stylesByKey.get(styleKey).rows.push(row);

    const variantKey = `${row.style.toLowerCase()}__${row.color.toLowerCase()}`;
    if (!variantsByKey.has(variantKey)) {
      variantsByKey.set(variantKey, { style: row.style, color: row.color, rows: [] });
    }
    variantsByKey.get(variantKey).rows.push(row);

    const variantSizeKey = `${row.style.toLowerCase()}__${row.color.toLowerCase()}__${row.normalizedSize}`;
    if (!variantSizesByKey.has(variantSizeKey)) variantSizesByKey.set(variantSizeKey, row);
  }

  return {
    rows: normalizedRows,
    stylesByKey,
    stylesByCode,
    variantsByKey,
    variantSizesByKey,
  };
}

export async function loadApparelCatalog(options = {}) {
  if (!options.forceReload && loadedCatalog) return loadedCatalog;

  const path = options.path || DEFAULT_CATALOG_PATH;
  let csvText = "";

  if (typeof window !== "undefined" && typeof fetch === "function") {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load apparel catalog (${response.status})`);
    csvText = await response.text();
  } else {
    const dynamicImport = new Function("specifier", "return import(specifier)");
    const fs = await dynamicImport("node:fs/promises");
    const nodePath = await dynamicImport("node:path");
    const cwd = typeof process !== "undefined" ? process.cwd() : ".";
    csvText = await fs.readFile(nodePath.resolve(cwd, options.serverPath || SERVER_CATALOG_PATH), "utf8");
  }

  loadedCatalog = createApparelCatalog(parseApparelCatalogCsv(csvText));
  return loadedCatalog;
}

export function setLoadedApparelCatalog(catalog) {
  loadedCatalog = catalog;
  return loadedCatalog;
}

function resolveCatalog(catalog) {
  return catalog || loadedCatalog || createApparelCatalog([]);
}

export function findStyle(style, catalog) {
  const resolved = resolveCatalog(catalog);
  const needle = normalizeText(style).toLowerCase();
  if (!needle) return null;
  if (resolved.stylesByKey.has(style)) return resolved.stylesByKey.get(style);
  return resolved.stylesByCode.get(needle)?.[0] || null;
}

export function findVariant(style, color, catalog) {
  const resolved = resolveCatalog(catalog);
  const variantKey = `${normalizeText(style).toLowerCase()}__${normalizeText(color).toLowerCase()}`;
  return resolved.variantsByKey.get(variantKey) || null;
}

export function findVariantSize(style, color, size, catalog) {
  const resolved = resolveCatalog(catalog);
  const variantSizeKey = `${normalizeText(style).toLowerCase()}__${normalizeText(color).toLowerCase()}__${normalizeSize(size)}`;
  return resolved.variantSizesByKey.get(variantSizeKey) || null;
}

export function getAvailableColors(style, catalog) {
  const styleGroup = findStyle(style, catalog);
  if (!styleGroup) return [];
  return [...new Set(styleGroup.rows.map((row) => row.color).filter(Boolean))];
}

export function getAvailableSizes(style, color, catalog) {
  const styleGroup = findStyle(style, catalog);
  if (!styleGroup) return [];
  const rows = color ? styleGroup.rows.filter((row) => row.color === color) : styleGroup.rows;
  return [...new Set(rows.map((row) => row.size).filter(Boolean))];
}

export function sortApparelSizes(sizes = []) {
  const order = ["YXS", "YS", "YM", "YL", "YXL", "OSFA", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "LT", "XLT", "2XLT"];
  return [...new Set(sizes.map((size) => normalizeSize(size)).filter(Boolean))].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b);
  });
}

export function calculateApparelLineCost(lineItem, catalog, options = {}) {
  const resolved = resolveCatalog(catalog);
  const mode = options.mode || "screen";
  const styleGroup = resolved.stylesByKey.get(lineItem.styleKey) || findStyle(lineItem.style || lineItem.styleCode, resolved);
  const sizes = options.sizes || (mode === "embroidery" ? sortApparelSizes((styleGroup?.rows || []).map((row) => row.size)) : DEFAULT_SCREEN_SIZES);
  const sizeQty = lineItem.sizeQty || lineItem.sizes || {};
  const totalQty = Object.values(sizeQty).reduce((sum, qty) => sum + toNumber(qty), 0);
  const matchedRows = (styleGroup?.rows || []).filter((row) => row.color === lineItem.color);

  if (mode === "dtf") {
    const selectedProduct = matchedRows[0] || (styleGroup?.rows || [])[0] || null;
    const baseApparelCost = toNumber(lineItem.apparelCost ?? selectedProduct?.casePrice ?? 0);
    const sizeUpchargeTotal = Object.entries(DTF_SIZE_UPCHARGES).reduce((sum, [size, upcharge]) => (
      sum + toNumber(sizeQty[size]) * upcharge
    ), 0);
    return {
      style: styleGroup?.style || lineItem.style || "",
      title: styleGroup?.title || lineItem.title || "",
      color: lineItem.color || "",
      totalQty,
      selectedProduct,
      apparelCostUsed: baseApparelCost,
      garmentCost: totalQty * baseApparelCost,
      sizeUpchargeTotal,
      sizePriceBreakdown: Object.entries(sizeQty).filter(([, qty]) => toNumber(qty) > 0).map(([size, qty]) => ({
        size,
        qty: toNumber(qty),
        blankCasePrice: baseApparelCost,
        sizeUpcharge: DTF_SIZE_UPCHARGES[size] || 0,
      })),
    };
  }

  const sizePriceBreakdown = sizes.map((size) => {
    const qty = toNumber(sizeQty[size]);
    if (qty <= 0) return null;
    const row = matchedRows.find((candidate) => normalizeSize(candidate.size) === normalizeSize(size))
      || (mode === "embroidery" ? (styleGroup?.rows || []).find((candidate) => normalizeSize(candidate.size) === normalizeSize(size)) : null);
    return {
      size,
      qty,
      blankCasePrice: row?.casePrice || 0,
    };
  }).filter(Boolean);

  const garmentCost = sizePriceBreakdown.reduce((sum, item) => sum + item.blankCasePrice * item.qty, 0);

  return {
    ...lineItem,
    style: styleGroup?.style || "",
    title: styleGroup?.title || "",
    totalQty,
    garmentCost,
    sizePriceBreakdown,
  };
}

export const apparelCatalogConstants = {
  DEFAULT_CATALOG_PATH,
  SERVER_CATALOG_PATH,
  DEFAULT_SCREEN_SIZES,
  DTF_SIZE_UPCHARGES,
};
