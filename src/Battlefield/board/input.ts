import { Pointer } from "../../Models";
import CellClicked from "../events/CellClicked";
import RightButtonClickedOnCell from "../events/RightButtonClickedOnCell";
import { MapState, MapTile } from "../Model";
import { refreshUI } from "../ui";

export function disableMapInput(state: MapState) {
  clearAllTileEvents(state);
  disableCellClick(state);
  state.dragDisabled = true;
}

export function enableMapInput(scene: Phaser.Scene, state: MapState) {
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
  scene: Phaser.Scene,
  state: MapState,
  cell: MapTile
) {
  cell.tile.on("pointerup", (pointer: Pointer) => {
    if (pointer.wasTouch || pointer.leftButtonReleased())
      CellClicked(scene).emit({
        scene,
        state,
        tile: cell,
        pointer: { x: pointer.upX, y: pointer.upY },
      });
  });
  cell.tile.on("pointerdown", (pointer: Pointer) => {
    if (pointer.rightButtonDown()) {
      RightButtonClickedOnCell(scene).emit({
        scene,
        state,
        tile: cell,
        pointer,
      });
    }
  });
}

export function clearAllTileEvents(state: MapState) {
  state.tiles.forEach((tile) => {
    tile.tile.removeAllListeners();
  });
}

export function clearAllTileTint(scene: Phaser.Scene, state: MapState) {
  state.tiles.forEach((tile) => {
    tile.tile.clearTint();
    scene.tweens.killTweensOf(tile.tile);
    tile.tile.alpha = 1;
  });
}
