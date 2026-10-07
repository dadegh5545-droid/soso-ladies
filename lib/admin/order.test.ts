import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bySortOrder, moveItem, nextSortOrder } from './order';

const items = [
  { id: 'a', sortOrder: 10 },
  { id: 'b', sortOrder: 20 },
  { id: 'c', sortOrder: 30 },
];

test('moving swaps neighbours and renumbers only what changed', () => {
  const { items: next, changed } = moveItem(items, 2, -1);
  assert.deepEqual(next.map((i) => i.id), ['a', 'c', 'b']);
  assert.deepEqual(changed.map((i) => [i.id, i.sortOrder]), [['c', 20], ['b', 30]]);
});

test('moving past either end changes nothing', () => {
  assert.equal(moveItem(items, 0, -1).changed.length, 0);
  assert.equal(moveItem(items, 2, 1).changed.length, 0);
});

test('records without sortOrder are renumbered too', () => {
  const unordered: { id: string; sortOrder?: number | null }[] = [{ id: 'x' }, { id: 'y' }];
  const { changed } = moveItem(unordered, 0, 1);
  assert.deepEqual(changed.map((i) => [i.id, i.sortOrder]), [['y', 10], ['x', 20]]);
});

test('next sort order and sorting', () => {
  assert.equal(nextSortOrder([]), 10);
  assert.equal(nextSortOrder(items), 40);
  const sorted = [{ id: '2', sortOrder: 5, createdAt: 'b' }, { id: '1', sortOrder: 5, createdAt: 'a' }, { id: '0', sortOrder: null }].sort(bySortOrder);
  assert.deepEqual(sorted.map((i) => i.id), ['0', '1', '2']);
});
