import { Chara } from '../../Chara/Model';
import { createEvent } from '../../utils';
import { MapScene } from '../MapScene';
import { refreshUI } from '../ui';

export function handleCloseSquadArrivedInfoMessage(
  scene: MapScene,
  chara: Chara
) {
  chara.destroy();
  refreshUI(scene);
  scene.state.isPaused = false;
}

export const key = 'CloseSquadArrivedInfoMessage';

export default (scene: Phaser.Scene) => createEvent<Chara>(scene.events, key);
