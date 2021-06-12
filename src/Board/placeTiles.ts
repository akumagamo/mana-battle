import { cartesianToIsometric } from '../utils/isometric';
import { BoardTile } from './Model';

export default (
  x: number,
  y: number,
  scene: Phaser.Scene,
  scale: number,
  { mapWidth, mapHeight }: { mapWidth: number; mapHeight: number }
) => {
  let grid: null[][] = [[]];
  let tiles: BoardTile[] = [];

  for (var x = 0; x < mapWidth; x++) {
    grid[x] = [];
    for (var y = 0; y < mapHeight; y++) grid[x][y] = null;
  }

  grid.forEach((row, yIndex) => {
    row.forEach((_, xIndex) => {
      let { x, y } = cartesianToIsometric(xIndex, yIndex);

      x = x * scale + x;
      y = y * scale + y;

      const tileSprite = scene.add.image(x, y, 'tile');
      tileSprite.scale = scale;
      tileSprite.depth = y;

      tiles.push({
        sprite: tileSprite,
        x,
        y,
        boardX: xIndex + 1,
        boardY: yIndex + 1,
      });
    });
  });

  return tiles;
};
