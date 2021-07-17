import { Chara } from "../../Chara/Model";
import { MOVE_SPEED } from "../config";
import { MapSquad, MapState } from "../Model";

export default function (
  state: MapState,
  next: { x: number; y: number },
  squad: MapSquad,
  chara: Chara
): void {
  if (next.x > squad.pos.x) {
    const nextStep = squad.pos.x + MOVE_SPEED;
    if (nextStep > next.x) squad.pos.x = next.x;
    else squad.pos.x = nextStep;

    chara.innerWrapper.scaleX = 1;
  } else if (next.x < squad.pos.x) {
    const nextStep = squad.pos.x - MOVE_SPEED;
    if (nextStep < next.x) squad.pos.x = next.x;
    else squad.pos.x = nextStep;

    chara.innerWrapper.scaleX = -1;
  } else if (next.y > squad.pos.y) {
    const nextStep = squad.pos.y + MOVE_SPEED;
    if (nextStep > next.y) squad.pos.y = next.y;
    else squad.pos.y = nextStep;
  } else if (next.y < squad.pos.y) {
    const nextStep = squad.pos.y - MOVE_SPEED;
    if (nextStep < next.y) squad.pos.y = next.y;
    else squad.pos.y = nextStep;
  }
  chara.container.setPosition(squad.pos.x, squad.pos.y);
  // TODO: update squad + add single source of "squad truth"
  state.squads = state.squads.update(squad.id, (sqd) => ({
    ...sqd,
    pos: squad.pos,
  }));
}
