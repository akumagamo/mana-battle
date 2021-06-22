import { Chara } from '../../Chara/Model';
import { createEvent } from '../../utils';
import { MapScene } from '../MapScene';
import { MapState } from '../Model';
import { refreshUI } from '../ui';

export function handleCloseSquadArrivedInfoMessage(
  scene: MapScene,
  state: MapState,
  chara: Chara
) {
  chara.destroy();
  refreshUI(scene, state);
  state.isPaused = false;
}

export const key = 'CloseSquadArrivedInfoMessage';

export default (scene: Phaser.Scene) => createEvent<Chara>(scene.events, key);
