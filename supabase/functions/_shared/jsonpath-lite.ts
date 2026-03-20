/** Dot-path getter for simple JSON shapes (e.g. "data.id", "id"). */

export function getByPath(obj: unknown, path: string | null | undefined): unknown {
  if (path == null || path === "") return obj;
  const parts = path.split(".").filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function getString(obj: unknown, path: string | null | undefined): string | undefined {
  const v = getByPath(obj, path);
  return typeof v === "string" ? v : undefined;
}
