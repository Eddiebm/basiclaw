import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { COUNTRIES } from "../../src/data/countries";

const outPath = join(process.cwd(), "mobile", "assets", "jurisdictions.json");
mkdirSync(dirname(outPath), { recursive: true });
const data = COUNTRIES.map((c) => ({ code: c.code.toLowerCase(), name: c.name, flag: c.flag }));
writeFileSync(outPath, JSON.stringify(data), "utf-8");
console.log("wrote", data.length, "jurisdictions to", outPath);
