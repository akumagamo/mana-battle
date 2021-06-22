import { getDistance } from '../../utils';
import { cellToScreenPosition } from '../board/position';
import startCombat from '../squads/startCombat';
import { cellSize, MOVE_SPEED } from '../config';
import { MapScene } from '../MapScene';
import finishMovement from './finishMovement';
import stepChara from './stepChara';
import { getChara, getMapSquad, MapState } from '../Model';

export default function (scene: MapScene, state: MapState) {
  const movedSquads = state.squadsInMovement.keySeq();

  let direction = '';

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

  // check collision
  // TODO: divide by each squad, store lists of enemies then compare
  movedSquads.forEach(async (sqd) => {
    const current = getChara(state, sqd);

    // TODO: only enemies
    // how: have indexes per team
    state.charas
      .filter((c) => {
        const a = getMapSquad(state, c.props.unit.squad).squad.force;
        const b = getMapSquad(state, sqd).squad.force;

        return a !== b;
      })
      .forEach((c) => {
        const distance = getDistance(c.container, current.container);

        if (distance < cellSize * 0.8) {
          state.isPaused = true;
          startCombat(
            scene,
            state,
            getMapSquad(state, sqd),
            getMapSquad(state, c.props.unit.squad),
            direction
          );
        }
      });
  });
}
