/**
 * Slice D — verify OpenAPI $ref targets exist relative to the openapi/ folder.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const openapiDir = path.join(root, "protocol", "vibecoding-broker-protocol", "openapi");
const yamlPath = path.join(openapiDir, "vbp-v1.openapi.yaml");

const yaml = fs.readFileSync(yamlPath, "utf8");
const refs = [...yaml.matchAll(/\$ref:\s*([^\s#]+)/g)].map((m) => m[1].trim());

let failed = false;
for (const r of refs) {
  if (r.startsWith("#")) continue;
  const resolved = path.normalize(path.join(openapiDir, r));
  if (!resolved.startsWith(path.dirname(openapiDir))) {
    console.error("Suspicious ref (path escape):", r);
    failed = true;
    continue;
  }
  if (!fs.existsSync(resolved)) {
    console.error("Missing $ref target:", r, "→", resolved);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("OpenAPI $ref check ok:", refs.filter((x) => !x.startsWith("#")).length, "file refs");
