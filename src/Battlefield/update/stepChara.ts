import { Chara } from '../../Chara/Model';
import { MOVE_SPEED, CHARA_MAP_SCALE } from '../config';
import { MapSquad, MapState } from '../Model';

export default function (
  scene: Phaser.Scene,
  state: MapState,
  next: { x: number; y: number },
  squad: MapSquad,
  direction: string,
  chara: Chara
): string {
  if (next.x > squad.pos.x) {
    squad.pos.x += 1 * MOVE_SPEED;
    direction = 'right';
    chara.innerWrapper.scaleX = 1;
  } else if (next.x < squad.pos.x) {
    squad.pos.x -= 1 * MOVE_SPEED;
    direction = 'left';
    chara.innerWrapper.scaleX = -1;
  } else if (next.y > squad.pos.y) {
    squad.pos.y += 1 * MOVE_SPEED;
    direction = 'bottom';
  } else if (next.y < squad.pos.y) {
    squad.pos.y -= 1 * MOVE_SPEED;
    direction = 'top';
  }
  chara.container.setPosition(squad.pos.x, squad.pos.y);
  // TODO: update squad + add single source of "squad truth"
  state.squads = state.squads.setIn([squad.id, 'pos'], squad.pos);
  return direction;
}
