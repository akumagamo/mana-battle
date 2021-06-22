import { Pointer } from '../../Models';
import CellClicked from '../events/CellClicked';
import { MapScene } from '../MapScene';
import { MapState, MapTile } from '../Model';
import { refreshUI } from '../ui';

export function disableMapInput(state: MapState) {
  clearAllTileEvents(state);
  disableCellClick(state);
  state.dragDisabled = true;
}

export function enableInput(scene: MapScene, state: MapState) {
  state.dragDisabled = false;
  enableCellClick(state);

  clearAllTileEvents(state);
  state.tiles.forEach((tile) => makeInteractive(scene, state, tile));

  refreshUI(scene, state);
}
export function disableCellClick(state: MapState) {
  state.cellClickDisabled = true;
}

export function enableCellClick(state: MapState) {
  state.cellClickDisabled = false;
}
export function makeInteractive(
  scene: MapScene,
  state: MapState,
  cell: MapTile
) {
  cell.tile.on('pointerup', (pointer: Pointer) =>
    CellClicked(scene).emit({
      scene,
      state,
      tile: cell,
      pointer: { x: pointer.upX, y: pointer.upY },
    })
  );
}

export function clearAllTileEvents(state: MapState) {
  state.tiles.forEach((tile) => {
    tile.tile.removeAllListeners();
  });
}

export function clearAllTileTint(scene: MapScene, state: MapState) {
  state.tiles.forEach((tile) => {
    tile.tile.clearTint();
    scene.tweens.killTweensOf(tile.tile);
    tile.tile.alpha = 1;
  });
}
