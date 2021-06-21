import { getDistance } from "../../utils";
import { cellToScreenPosition } from "../board/position";
import { cellSize, MOVE_SPEED } from "../config";
import { MapScene } from "../MapScene";
import finishMovement from "./finishMovement";
import stepChara from "./stepChara";

export default function (scene: MapScene) {
  const movedSquads = scene.squadsInMovement.keySeq();

  let direction = "";

  scene.squadsInMovement.forEach(async (value, squadId) => {
    const { path, squad } = value;

    const [head] = path;

    const next = cellToScreenPosition(head);

    const dist = getDistance(squad.pos, next);

    const chara = await scene.getChara(squadId);

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
    const current = await scene.getChara(sqd);

    // TODO: only enemies
    // how: have indexes per team
    scene.charas
      .filter((c) => {
        const a = scene.getMapSquad(c.props.unit.squad).squad.force;
        const b = scene.getMapSquad(sqd).squad.force;

        return a !== b;
      })
      .forEach((c) => {
        const distance = getDistance(c.container, current.container);

        if (distance < cellSize * 0.8) {
          scene.isPaused = true;
          scene.startCombat(
            scene.getMapSquad(sqd),
            scene.getMapSquad(c.props.unit.squad),
            direction
          );
        }
      });
  });
}
