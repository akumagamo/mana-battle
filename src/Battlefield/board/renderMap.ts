import { tileMap, translateTiles } from '../Model';
import { MapScene } from '../MapScene';
import { cellToScreenPosition } from './position';
import { cellSize } from '../config';

export default (scene: MapScene) => {
  const { mapContainer } = scene.state;
  translateTiles(scene.state.cells).forEach((arr, col) =>
    arr.forEach((n, row) => {
      const { x, y } = cellToScreenPosition({ x: row, y: col });

      const tile = scene.add.image(x, y, `tiles/${tileMap[n]}`);

      tile.setInteractive();

      mapContainer.add(tile);

      scene.input.setDraggable(tile);

      tile.displayWidth = cellSize;
      tile.displayHeight = cellSize;

      const mapTile = {
        x: row,
        y: col,
        type: n,
        tile: tile,
      };
      scene.state.tiles.push(mapTile);

      if (!scene.state.tileIndex[col]) scene.state.tileIndex[col] = [];
      scene.state.tileIndex[col][row] = mapTile;
    })
  );
};
