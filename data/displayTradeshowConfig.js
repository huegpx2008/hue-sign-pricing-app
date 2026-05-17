import generated from "./displayProducts.generated.json";

export const displayTradeshowCatalog = generated.products || [];

export const displayTradeshowTagList = Array.from(
  new Set(displayTradeshowCatalog.flatMap((product) => product.tags || []))
).filter(Boolean).sort();

export const displayTradeshowParserMeta = {
  generatedAt: generated.generatedAt || null,
  sourceDir: generated.sourceDir || "public/data/display",
  parserVersion: generated.parserVersion || 1,
};
