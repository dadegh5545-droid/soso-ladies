/** Ordering helpers for the admin lists (pure, so they are unit-tested). */

export const bySortOrder = <T extends { sortOrder?: number | null; createdAt?: string }>(a: T, b: T) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.createdAt ?? '').localeCompare(b.createdAt ?? '');

/**
 * Moves one item up or down and renumbers sortOrder (10, 20, 30…). Returns
 * the reordered list and the items whose sortOrder changed.
 */
export function moveItem<T extends { id: string; sortOrder?: number | null }>(
  items: T[],
  index: number,
  delta: -1 | 1,
): { items: T[]; changed: T[] } {
  const target = index + delta;
  if (target < 0 || target >= items.length) return { items, changed: [] };
  const reordered = [...items];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  const changed: T[] = [];
  const renumbered = reordered.map((item, i) => {
    const sortOrder = (i + 1) * 10;
    if (item.sortOrder === sortOrder) return item;
    const next = { ...item, sortOrder };
    changed.push(next);
    return next;
  });
  return { items: renumbered, changed };
}

export const nextSortOrder = (items: { sortOrder?: number | null }[]) =>
  items.reduce((max, item) => Math.max(max, item.sortOrder ?? 0), 0) + 10;
