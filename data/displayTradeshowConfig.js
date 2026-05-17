import { displayProductsCatalog } from "./displayProductsCatalog";

export const displayTradeshowCatalog = displayProductsCatalog;
export const displayTradeshowTagList = Array.from(
  new Set(displayTradeshowCatalog.flatMap((p) => p.tags || []))
).sort();
