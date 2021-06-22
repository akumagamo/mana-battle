import { getDistance } from "../../utils";
import { cellToScreenPosition } from "../board/position";
import startCombat from "../squads/startCombat";
import { cellSize, MOVE_SPEED } from "../config";
import { MapScene } from "../MapScene";
import finishMovement from "./finishMovement";
import stepChara from "./stepChara";
import { getChara, getMapSquad } from "../Model";

export default function (scene: MapScene) {
  const movedSquads = scene.squadsInMovement.keySeq();

  let direction = "";

  scene.squadsInMovement.forEach(async (value, squadId) => {
    const { path, squad } = value;

    const [head] = path;

    const next = cellToScreenPosition(head);

    const dist = getDistance(squad.pos, next);

    const chara = getChara(scene.state, squadId);

    if (dist >= MOVE_SPEED) {
      direction = stepChara(scene, next, squad, direction, chara);
    } else {
      await finishMovement(scene, path, squad);
    }

    return squadId;
  });

  // check collision
  // TODO: divide by each squad, store lists of enemies then compare
  movedSquads.forEach(async (sqd) => {
    const current = getChara(scene.state, sqd);

    // TODO: only enemies
    // how: have indexes per team
    scene.state.charas
      .filter((c) => {
        const a = getMapSquad(scene.state, c.props.unit.squad).squad.force;
        const b = getMapSquad(scene.state, sqd).squad.force;

        return a !== b;
      })
      .forEach((c) => {
        const distance = getDistance(c.container, current.container);

        if (distance < cellSize * 0.8) {
          scene.isPaused = true;
          startCombat(
            scene,
            getMapSquad(scene.state, sqd),
            getMapSquad(scene.state, c.props.unit.squad),
            direction
          );
        }
      });
  });
}
