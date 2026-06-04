import { getServerApparelCatalogStatus, loadApparelCatalog } from "../lib/catalog/apparel-catalog.js";
import { calculateScreenprintPricing } from "../lib/pricing/screenprint.js";

const payload = {
  lineItems: [
    {
      style: "2000",
      color: "Black",
      sizes: {
        S: 12,
        M: 12,
        L: 12,
        XL: 12,
      },
    },
  ],
  locations: [
    { name: "Front", colors: 1 },
    { name: "Back", colors: 1 },
  ],
  sameDesign: true,
  darkGarments: true,
  whiteUnderbase: true,
  setupFeeEnabled: true,
};

try {
  const catalogStatus = await getServerApparelCatalogStatus();
  const catalog = await loadApparelCatalog({ forceReload: true });
  const result = calculateScreenprintPricing(payload, catalog);

  console.log(JSON.stringify({
    ok: true,
    privateCatalogExists: catalogStatus.exists,
    privateCatalogPath: catalogStatus.resolvedPath,
    requestedStylesColors: payload.lineItems.map((item) => ({ style: item.style, color: item.color })),
    result: {
      retail: result.retail,
      each: result.each,
      totalGarments: result.totalGarments,
    },
  }, null, 2));
} catch (error) {
  const catalogStatus = await getServerApparelCatalogStatus();
  console.error(JSON.stringify({
    ok: false,
    route: "debug-screenprint-pricing",
    message: error?.message || String(error),
    stack: error?.stack || "",
    privateCatalogExists: catalogStatus.exists,
    privateCatalogPath: catalogStatus.resolvedPath,
    requestedStylesColors: payload.lineItems.map((item) => ({ style: item.style, color: item.color })),
  }, null, 2));
  process.exitCode = 1;
}
