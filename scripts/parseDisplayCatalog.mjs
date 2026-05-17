import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const DISPLAY_DIR = path.join(ROOT, "public/data/display");
const OUTPUT_FILE = path.join(ROOT, "data/displayProducts.generated.json");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

function hasTesseract() {
  try {
    execSync("tesseract --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function normalize(text) {
  return text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractValue(regex, text) {
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function parsePriceTiers(block) {
  const tiers = [];
  const rx = /(\d+)\s*[-–]\s*(\d+)\s*\$\s*([\d,.]+)|(?:call\s*us|call\s*for\s*pricing)/gi;
  let m;
  while ((m = rx.exec(block)) !== null) {
    if (m[1] && m[2] && m[3]) {
      tiers.push({ min: Number(m[1]), max: Number(m[2]), retailEach: Number(m[3].replace(/,/g, "")) });
    } else {
      tiers.push({ min: null, max: null, retailEach: "CALL" });
    }
  }
  return tiers;
}

function inferProductFromText(fileName, ocrText, confidence) {
  const lower = ocrText.toLowerCase();
  const productName = extractValue(/^(.*?)(?:\n|$)/, ocrText) || path.basename(fileName, path.extname(fileName));

  const sides = [];
  if (lower.includes("single sided") || lower.includes("single-sided")) sides.push("Single-Sided");
  if (lower.includes("double sided") || lower.includes("double-sided")) sides.push("Double-Sided");

  const sizeMatches = [...ocrText.matchAll(/(\d+(?:\.\d+)?)\s*ft/gi)].map((m) => `${m[1]}ft`);
  const uniqueSizes = [...new Set(sizeMatches)];

  const freeShipping = /free\s+shipping/i.test(ocrText);
  const replacementGraphicsSupported = /graphic\s*only|replacement\s*graphic/i.test(ocrText);
  const moqMatch = ocrText.match(/(?:MOQ|minimum(?:\s+order)?\s+quantity)\s*[:\-]?\s*(\d+)/i);

  const tiers = parsePriceTiers(ocrText);

  const missingFields = [];
  if (!productName) missingFields.push("name");
  if (!uniqueSizes.length) missingFields.push("sizes");
  if (!tiers.length) missingFields.push("tierPricing");

  const status = confidence < 0.75 || missingFields.length ? "needs_review" : "parsed";

  return {
    id: path.basename(fileName, path.extname(fileName)).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: "Display / Tradeshow Products",
    subcategory: "",
    name: productName,
    tags: [],
    description: "",
    imageReference: `public/data/display/${fileName}`,
    parsedFromFile: fileName,
    ocrConfidence: confidence,
    status,
    missingFields,
    notes: "Auto-parsed from screenshot. Verify before production use.",
    freeShipping,
    moq: moqMatch ? Number(moqMatch[1]) : null,
    soldInSets: false,
    setQuantities: [],
    replacementGraphicsSupported,
    hardwareOptions: [],
    sidedOptions: sides,
    sizes: uniqueSizes.map((label) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      tierPricing: tiers,
    })),
    shippingNotes: freeShipping ? "Free shipping noted in screenshot" : "",
    productNotes: "",
    rawExtractPreview: normalize(ocrText).slice(0, 1500),
  };
}

function ocrWithTesseract(fullPath) {
  try {
    const stdout = execSync(`tesseract "${fullPath}" stdout --oem 1 --psm 6 tsv`, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    const lines = stdout.split("\n").slice(1).filter(Boolean);
    let text = "";
    let confSum = 0;
    let confCount = 0;
    for (const line of lines) {
      const cols = line.split("\t");
      if (cols.length < 12) continue;
      const conf = Number(cols[10]);
      const word = cols[11];
      if (word && word.trim()) text += `${word} `;
      if (!Number.isNaN(conf) && conf >= 0) {
        confSum += conf;
        confCount += 1;
      }
    }
    return { text: text.trim(), confidence: confCount ? Math.max(0, Math.min(1, (confSum / confCount) / 100)) : 0 };
  } catch {
    return { text: "", confidence: 0 };
  }
}

function main() {
  const result = {
    generatedAt: new Date().toISOString(),
    sourceDir: "public/data/display",
    parserVersion: 1,
    products: [],
  };

  if (!fs.existsSync(DISPLAY_DIR)) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log("Display directory not found. Wrote empty generated dataset.");
    return;
  }

  const files = fs.readdirSync(DISPLAY_DIR).filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()));
  const canOCR = hasTesseract();

  for (const fileName of files) {
    const fullPath = path.join(DISPLAY_DIR, fileName);
    const { text, confidence } = canOCR ? ocrWithTesseract(fullPath) : { text: "", confidence: 0 };
    result.products.push(inferProductFromText(fileName, text, confidence));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`Parsed ${result.products.length} display screenshots.`);
}

main();
