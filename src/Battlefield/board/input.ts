import { MapScene } from "../MapScene";

export function disableMapInput(scene: MapScene) {
  scene.clearAllTileEvents();
  this.disableCellClick();
  scene.dragDisabled = true;
}

export function enableInput(scene: MapScene) {
  scene.dragDisabled = false;
  scene.enableCellClick();

  scene.clearAllTileEvents();
  scene.tiles.forEach((tile) => scene.makeInteractive(tile));

  scene.refreshUI();
}
