import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const families: Record<string, string> = {
  "원,링": "round", "마름모": "diamond", "보타이": "bowtie",
  "씨앗, 물방울": "seed", "타일, 픽셀": "tile", "새": "wing",
};
const colors: Record<string, string> = {
  "갈색": "brown", "녹색": "green", "아이보리": "ivory",
  "주황색": "orange", "하늘색": "blue", "회색": "gray",
};
const files = (await readdir("components")).filter(file => file.endsWith(".svg")).sort();
const assets = await Promise.all(files.map(async fileName => {
  const [familyName, variant, colorName] = fileName.slice(0, -4).split("_");
  const family = families[familyName];
  const color = colors[colorName];
  if (!family || !color || !/^\d+$/.test(variant)) throw new Error(`Unknown sticker: ${fileName}`);
  const svg = (await readFile(join("components", fileName), "utf8")).replace(/\r\n/g, "\n").trim();
  // Only local, self-contained artwork belongs in the browser/download catalog.
  if (!svg.startsWith("<svg ") || /<script|<foreignObject|\bon\w+\s*=|\b(?:href|src)\s*=/i.test(svg)) {
    throw new Error(`Unsupported SVG content: ${fileName}`);
  }
  return { id: `${family}-${variant}-${color}`, family, variant: Number(variant), color, fileName, svg };
}));
await writeFile("src/data/sticker-assets.json", JSON.stringify(assets, null, 2) + "\n");
console.log(`Indexed ${assets.length} SVG stickers from components/`);
