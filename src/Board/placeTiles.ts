import { cartesianToIsometric } from '../utils/isometric';
import { BoardTile } from './Model';

export default (
  scene: Phaser.Scene,
  scale: number,
  { mapWidth, mapHeight }: { mapWidth: number; mapHeight: number }
) => {
  let grid: null[][] = [[]];
  let tiles: BoardTile[] = [];

  for (let x_ = 0; x_ < mapWidth; x_++) {
    grid[x_] = [];
    for (let y_ = 0; y_ < mapHeight; y_++) grid[x_][y_] = null;
  }

  grid.forEach((row, yIndex) => {
    row.forEach((_, xIndex) => {
      let pos = cartesianToIsometric(xIndex, yIndex);

      const x_ = pos.x * scale ;
      const y_ = pos.y * scale ;

      const tileSprite = scene.add.image(x_, y_, 'tile');
      tileSprite.scale = scale;
      tileSprite.depth = y_;

      tiles.push({
        sprite: tileSprite,
        x: x_,
        y: y_,
        boardX: xIndex + 1,
        boardY: yIndex + 1,
      });
    });
  });

  return tiles;
};
