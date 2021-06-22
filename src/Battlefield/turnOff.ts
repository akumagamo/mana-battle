import { MapScene } from './MapScene';
import { DEFAULT_MODE } from './Mode';
import events from './events';
import { MapState } from './Model';

export default function (scene: MapScene, state: MapState) {
  state.mapContainer.destroy();
  state.uiContainer.destroy();
  state.charas.forEach((chara) => chara.destroy());
  state.charas = [];
  state.tiles.forEach((tile) => {
    tile.tile.destroy();
  });
  state.tiles = [];
  state.tileIndex = [[]];

  state.mode = DEFAULT_MODE;

  scene.scene.manager.stop('MapScene');

  Object.keys(events).forEach((k) => scene.events.off(k));
}
