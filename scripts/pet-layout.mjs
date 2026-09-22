// Screen coordinates: up = 0°, right = 90°, clockwise, 22.5° per cell.
export function lookIndex(x, y) {
  if (Math.hypot(x, y) < 12) return null;
  return (Math.round(Math.atan2(x, -y) * 8 / Math.PI) + 16) % 16;
}

export function lookCell(index) {
  // V2 assembler/validator reserve idle's seventh cell for the neutral look.
  if (index === null) return {row:0, column:6};
  if (!Number.isInteger(index) || index < 0 || index > 15) throw new RangeError('Look index must be 0–15');
  return {row:9 + Math.floor(index / 8), column:index % 8};
}
