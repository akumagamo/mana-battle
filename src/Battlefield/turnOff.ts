import { MapScene } from './MapScene';
import { DEFAULT_MODE } from './Mode';
import events from './events';

export default function (scene: MapScene) {
  scene.state.mapContainer.destroy();
  scene.state.uiContainer.destroy();
  scene.state.charas.forEach((chara) => chara.destroy());
  scene.state.charas = [];
  scene.state.tiles.forEach((tile) => {
    tile.tile.destroy();
  });
  scene.state.tiles = [];
  scene.state.tileIndex = [[]];

  scene.state.mode = DEFAULT_MODE;

  scene.scene.manager.stop('MapScene');

  Object.keys(events).forEach((k) => scene.events.off(k));
}
