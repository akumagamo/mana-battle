import { Pointer } from '../../Models';
import CellClicked from '../events/CellClicked';
import { MapScene } from '../MapScene';
import { MapTile } from '../Model';
import { refreshUI } from '../ui';

export function disableMapInput(scene: MapScene) {
  clearAllTileEvents(scene);
  disableCellClick(scene);
  scene.state.dragDisabled = true;
}

export function enableInput(scene: MapScene) {
  scene.state.dragDisabled = false;
  enableCellClick(scene);

  clearAllTileEvents(scene);
  scene.state.tiles.forEach((tile) => makeInteractive(scene, tile));

  refreshUI(scene);
}
export function disableCellClick(scene: MapScene) {
  scene.state.cellClickDisabled = true;
}

export function enableCellClick(scene: MapScene) {
  scene.state.cellClickDisabled = false;
}
export function makeInteractive(scene: MapScene, cell: MapTile) {
  cell.tile.on('pointerup', (pointer: Pointer) =>
    CellClicked(scene).emit({
      scene: scene,
      tile: cell,
      pointer: { x: pointer.upX, y: pointer.upY },
    })
  );
}

export function clearAllTileEvents(scene: MapScene) {
  scene.state.tiles.forEach((tile) => {
    tile.tile.removeAllListeners();
  });
}

export function clearAllTileTint(scene: MapScene) {
  scene.state.tiles.forEach((tile) => {
    tile.tile.clearTint();
    scene.tweens.killTweensOf(tile.tile);
    tile.tile.alpha = 1;
  });
}
