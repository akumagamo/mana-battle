import { isPointerInTile } from './isPointerInTile';

const tiles = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
].map((t) => ({ sprite: { displayOriginX: t.x, displayOriginY: t.y } }));

test('Obtains actual stat value', () => {
  expect(isPointerInTile({ x: 12, y: 12 })(tiles[0])).toBe(true);
});
