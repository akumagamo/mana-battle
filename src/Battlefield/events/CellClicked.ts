import { Vector } from 'matter';
import { GAME_SPEED } from '../../env';
import { tween } from '../../Scenes/utils';
import { createEvent } from '../../utils';
import { MapScene } from '../MapScene';
import signal from '../signal';

export const key = 'CellClicked';

export async function handleCellClick({
  scene,
  tile,
  pointer,
}: {
  scene: MapScene;
  tile: Vector;
  pointer: Vector;
}) {
  if (!scene.state.cellClickDisabled)
    signal(scene, 'regular click cell', [{ type: 'CLICK_CELL', cell: tile }]);

  var ping = scene.add.circle(pointer.x, pointer.y, 20, 0xffff66);

  await tween(scene, {
    targets: ping,
    alpha: 0,
    duration: 500 / GAME_SPEED,
    scale: 2,
    onComplete: () => ping.destroy(),
  });
}

export default (scene: MapScene) =>
  createEvent<{ scene: MapScene; tile: Vector; pointer: Vector }>(
    scene.events,
    key
  );
