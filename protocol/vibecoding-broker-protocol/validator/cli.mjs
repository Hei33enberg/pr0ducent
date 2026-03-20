#!/usr/bin/env node
/**
 * Stub: npx vbp-validate https://api.builder.com/vbp/v1
 * Full implementation: HEAD dispatch, schema validation, optional dry-run dispatch with test key.
 */
const base = process.argv[2];
if (!base) {
  console.error("Usage: vbp-validate <vbp_base_url>");
  process.exit(1);
}
console.log("vbp-validate (stub): would probe", base.replace(/\/$/, ""));
console.log("See docs/VBP-SPEC.md and docs/vbp-schemas/ for required behavior.");
process.exit(0);
