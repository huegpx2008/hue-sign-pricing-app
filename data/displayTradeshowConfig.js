import generated from "./displayProducts.generated.json";
import { fallbackDisplayCatalog } from "./displayProductsFallback";


const parsedProducts = generated.products || [];
export const displayDataSource = parsedProducts.length ? "parsed data" : "fallback catalog data";

export const displayTradeshowCatalog = parsedProducts.length ? parsedProducts : fallbackDisplayCatalog;

export const displayTradeshowTagList = Array.from(
  new Set(displayTradeshowCatalog.flatMap((product) => product.tags || []))
).filter(Boolean).sort();

export const displayTradeshowParserMeta = {
  generatedAt: generated.generatedAt || null,
  sourceDir: generated.sourceDir || "public/data/display",
  parserVersion: generated.parserVersion || 1,
};