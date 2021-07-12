import { getCity, MapState } from '../Model';
import signal from '../signal';
import { refreshUI } from '../ui';

export default async function (scene: Phaser.Scene, state: MapState, id: string) {
  refreshUI(scene, state);
  const { x, y } = getCity(state, id);

  signal(scene, state, 'selectCity', [
    { type: 'MOVE_CAMERA_TO', x, y, duration: 500 },
  ]);
}
