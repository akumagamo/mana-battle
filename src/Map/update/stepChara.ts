import { Chara } from "../../Chara/Model";
import { MOVE_SPEED, CHARA_MAP_SCALE } from "../config";
import { MapScene } from "../MapScene";
import { MapSquad } from "../Model";

export default function (
  scene: MapScene,
  next: { x: number; y: number },
  squad: MapSquad,
  direction: string,
  chara: Chara
) {
  if (next.x > squad.pos.x) {
    squad.pos.x += 1 * MOVE_SPEED;
    direction = "right";
    chara.container.scaleX = CHARA_MAP_SCALE;
  } else if (next.x < squad.pos.x) {
    squad.pos.x -= 1 * MOVE_SPEED;
    direction = "left";
    chara.container.scaleX = CHARA_MAP_SCALE * -1;
  } else if (next.y > squad.pos.y) {
    squad.pos.y += 1 * MOVE_SPEED;
    direction = "bottom";
  } else if (next.y < squad.pos.y) {
    squad.pos.y -= 1 * MOVE_SPEED;
    direction = "top";
  }
  chara.container.setPosition(squad.pos.x, squad.pos.y);
  // TODO: update squad + add single source of "squad truth"
  scene.updateState({
    ...scene.state,
    squads: scene.state.squads.setIn([squad.id, "pos"], squad.pos),
  });
  return direction;
}
