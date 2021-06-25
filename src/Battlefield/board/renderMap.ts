import { MapState, tileMap, translateTiles } from '../Model';
import { cellToScreenPosition } from './position';
import { cellSize } from '../config';

export default (scene: Phaser.Scene, state: MapState) => {
  const { mapContainer } = state;
  translateTiles(state.cells).forEach((arr, col) =>
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
      state.tiles.push(mapTile);

      if (!state.tileIndex[col]) state.tileIndex[col] = [];
      state.tileIndex[col][row] = mapTile;
    })
  );
};
