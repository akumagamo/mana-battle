import { getDistance } from "../../utils";
import { cellToScreenPosition } from "../board/position";
import { MOVE_SPEED } from "../config";
import finishMovement from "./finishMovement";
import stepChara from "./stepChara";
import { getChara, getMapSquad, MapState } from "../Model";
import { checkCollision } from "./checkCollision";
import startCombat from "../squads/startCombat";

export default function (scene: Phaser.Scene, state: MapState) {
  const movedSquads = state.squadsInMovement.keySeq();

  let direction = "";

  state.squadsInMovement.forEach(async (value, squadId) => {
    const { path, squad } = value;

    const [head] = path;

    const next = cellToScreenPosition(head);

    const dist = getDistance(squad.pos, next);

    const chara = getChara(state, squadId);

    if (dist >= MOVE_SPEED) {
      direction = stepChara(scene, state, next, squad, direction, chara);
    } else {
      await finishMovement(scene, state, path, squad);
    }

    return squadId;
  });

  // TODO: divide by each squad, store lists of enemies then compare
  movedSquads.forEach((id) => {
    const collided = checkCollision(state, scene, direction)(id);

    if (collided)
      startCombat(
        scene,
        state,
        getMapSquad(state, id),
        getMapSquad(state, collided.props.unit.squad),
        direction // TODO: direction is bugged, is using the last iteration
      );
  });
}
