import { Vector } from 'matter';
import { GAME_SPEED } from '../../env';
import { tween } from '../../Scenes/utils';
import { createEvent } from '../../utils';
import { MapState } from '../Model';
import signal from '../signal';

export const key = 'CellClicked';

export async function handleCellClick({
  scene,
  state,
  tile,
  pointer,
}: {
  scene: Phaser.Scene;
  state: MapState;
  tile: Vector;
  pointer: Vector;
}) {
  if (!state.cellClickDisabled)
    signal(scene, state, 'regular click cell', [
      { type: 'CLICK_CELL', cell: tile },
    ]);

  var ping = scene.add.image(pointer.x, pointer.y, 'ping');
  ping.setScale(0.1);

  tween(scene, {
    targets: ping,
    alpha: 0,
    duration: 300 / GAME_SPEED,
    scale: 0.6,
  });
  handlePhaserTweenInterruptionBug(scene, ping);
}

export default (scene: Phaser.Scene) =>
  createEvent<{
    scene: Phaser.Scene;
    state: MapState;
    tile: Vector;
    pointer: Vector;
  }>(scene.events, key);

function handlePhaserTweenInterruptionBug(
  scene: Phaser.Scene,
  ping: Phaser.GameObjects.Image
) {
  scene.time.addEvent({
    delay: 300 / GAME_SPEED,
    callback: () => {
      ping.destroy();
    },
  });
}
