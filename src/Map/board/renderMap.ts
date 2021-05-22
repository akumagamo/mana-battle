import { tileMap, translateTiles } from '../Model';
import { MapScene } from '../MapScene';
import { getPos } from './position';
import { cellSize } from '../config';

export default (scene: MapScene) => {
  const { container } = scene.getContainers();
  translateTiles(scene.state.cells).forEach((arr, col) =>
    arr.forEach((n, row) => {
      const { x, y } = getPos({ x: row, y: col });

      const tile = scene.add.image(x, y, `tiles/${tileMap[n]}`);

      tile.setInteractive();

      container.add(tile);

      scene.input.setDraggable(tile);

      tile.displayWidth = cellSize;
      tile.displayHeight = cellSize;

      const mapTile = {
        x: row,
        y: col,
        type: n,
        tile: tile,
      };
      scene.tiles.push(mapTile);

      if (!scene.tileIndex[col]) scene.tileIndex[col] = [];
      scene.tileIndex[col][row] = mapTile;
    })
  );
};
