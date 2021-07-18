import { Chara } from "../../Chara/Model";
import { GAME_SPEED } from "../../env";
import { MOVE_SPEED } from "../config";
import { MapSquad, MapState } from "../Model";

export default function (
  state: MapState,
  next: { x: number; y: number },
  squad: MapSquad,
  chara: Chara
): void {
  if (next.x > squad.posScreen.x) {
    const nextStep = squad.posScreen.x + MOVE_SPEED * GAME_SPEED;
    if (nextStep > next.x) squad.posScreen.x = next.x;
    else squad.posScreen.x = nextStep;

    chara.innerWrapper.scaleX = 1;
  } else if (next.x < squad.posScreen.x) {
    const nextStep = squad.posScreen.x - MOVE_SPEED * GAME_SPEED;
    if (nextStep < next.x) squad.posScreen.x = next.x;
    else squad.posScreen.x = nextStep;

    chara.innerWrapper.scaleX = -1;
  } else if (next.y > squad.posScreen.y) {
    const nextStep = squad.posScreen.y + MOVE_SPEED * GAME_SPEED;
    if (nextStep > next.y) squad.posScreen.y = next.y;
    else squad.posScreen.y = nextStep;
  } else if (next.y < squad.posScreen.y) {
    const nextStep = squad.posScreen.y - MOVE_SPEED * GAME_SPEED;
    if (nextStep < next.y) squad.posScreen.y = next.y;
    else squad.posScreen.y = nextStep;
  }
  chara.container.setPosition(squad.posScreen.x, squad.posScreen.y);
  // TODO: update squad + add single source of "squad truth"
  state.squads = state.squads.update(squad.id, (sqd) => ({
    ...sqd,
    posScreen: squad.posScreen,
  }));
}
