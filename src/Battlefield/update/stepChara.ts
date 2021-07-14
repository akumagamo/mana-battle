import {Chara} from '../../Chara/Model';
import {MOVE_SPEED} from '../config';
import {MapSquad, MapState} from '../Model';

export default function (
  state: MapState,
  next: {x: number; y: number},
  squad: MapSquad,
  chara: Chara,
): void {
  if (next.x > squad.pos.x) {
    squad.pos.x += 1 * MOVE_SPEED;
    chara.innerWrapper.scaleX = 1;
  } else if (next.x < squad.pos.x) {
    squad.pos.x -= 1 * MOVE_SPEED;
    chara.innerWrapper.scaleX = -1;
  } else if (next.y > squad.pos.y) {
    squad.pos.y += 1 * MOVE_SPEED;
  } else if (next.y < squad.pos.y) {
    squad.pos.y -= 1 * MOVE_SPEED;
  }
  chara.container.setPosition(squad.pos.x, squad.pos.y);
  // TODO: update squad + add single source of "squad truth"
  state.squads = state.squads.setIn([squad.id, 'pos'], squad.pos);
}
