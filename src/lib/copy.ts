/**
 * English UI copy (single source: `en.json`). No i18n — import `copy` and use `copy["key"]`.
 */
import en from "../locales/en.json";

export type CopyKey = keyof typeof en;
export const copy: typeof en = en;
