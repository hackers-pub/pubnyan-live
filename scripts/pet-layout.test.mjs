import test from 'node:test';
import assert from 'node:assert/strict';
import { lookIndex, lookCell } from './pet-layout.mjs';

test('pointer axes use up as zero and clockwise screen coordinates', () => {
  assert.deepEqual([[0, -100], [100, 0], [0, 100], [-100, 0]].map(([x,y]) => lookIndex(x,y)), [0,4,8,12]);
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    assert.equal(lookIndex(100 * Math.sin(a), -100 * Math.cos(a)), i);
  }
  assert.equal(lookIndex(-1, -100), 0);
});

test('neutral uses idle, never the up direction', () => {
  assert.equal(lookIndex(0, 0), null);
  assert.equal(lookIndex(5, 5), null);
  assert.deepEqual(lookCell(null), {row:0, column:6});
});

test('all 16 directions fill exactly the last two rows', () => {
  const cells = Array.from({length:16}, (_,i) => lookCell(i));
  assert.deepEqual(cells[0], {row:9, column:0});
  assert.deepEqual(cells[7], {row:9, column:7});
  assert.deepEqual(cells[8], {row:10, column:0});
  assert.deepEqual(cells[15], {row:10, column:7});
  assert.equal(new Set(cells.map(c=>`${c.row},${c.column}`)).size,16);
  assert.throws(()=>lookCell(16));
  assert.throws(()=>lookCell(-1));
});
