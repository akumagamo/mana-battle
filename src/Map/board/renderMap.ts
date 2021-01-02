import {tileMap, translateTiles} from '../Model';
import {cellSize, MapScene} from '../MapScene';

export default (scene: MapScene) => {
  const {container} = scene.getContainers();
  translateTiles(scene.state.cells).forEach((arr, col) =>
    arr.forEach((n, row) => {
      const {x, y} = scene.getPos({x: row, y: col});

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
    }),
  );
};
