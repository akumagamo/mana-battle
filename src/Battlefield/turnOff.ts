import { DEFAULT_MODE } from './Mode';
import events from './events';
import { initialBattlefieldState, MapState } from './Model';

export default function (scene: Phaser.Scene, state: MapState) {
  state.mapContainer.destroy();
  state.uiContainer.destroy();
  state.missionContainer.destroy();

  scene.scene.manager.stop('Phaser.Scene');

  state = initialBattlefieldState;

  Object.keys(events()).forEach((k) => scene.events.off(k));
}
