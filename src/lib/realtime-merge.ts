/** Helpers for Slice C — avoid stale loadInitialData overwriting fresher Realtime rows. */

export function isoToMs(iso: string | undefined | null): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function shouldReplaceTaskRow(
  prev: { updated_at?: string } | undefined,
  incoming: { updated_at?: string },
): boolean {
  if (!prev) return true;
  return isoToMs(incoming.updated_at) >= isoToMs(prev.updated_at);
}

export function shouldReplaceBuilderResultRow(
  prev: { updated_at?: string } | undefined,
  incoming: { updated_at?: string },
): boolean {
  if (!prev) return true;
  return isoToMs(incoming.updated_at) >= isoToMs(prev.updated_at);
}
