import {Vector} from 'matter';
import {PLAYER_FORCE} from '../../constants';
import {getPathTo} from '../api';
import {screenToCellPosition} from '../board/position';
import {changeMode} from '../Mode';
import {getMapSquad, MapState} from '../Model';

export default async function (
  scene: Phaser.Scene,
  state: MapState,
  id: string,
  target: Vector,
) {
  const squad = getMapSquad(state, id);

  const grid = makeWalkableGrid(state);

  const startCell = screenToCellPosition(squad.pos);

  const [, ...path] = getPathTo(grid)(startCell)(target).map(([x, y]) => ({
    x,
    y,
  }));

  state.squadsInMovement = state.squadsInMovement.set(id, {
    path,
    squad,
  });

  // TODO: remove this, moving squad should have no relation with selection
  if (squad.squad.force === PLAYER_FORCE)
    changeMode(scene, state, {type: 'SQUAD_SELECTED', id});
}

function makeWalkableGrid(state: MapState): number[][] {
  return state.cells.map((c) =>
    c.map((cell) => {
      if (cell === 3) return 1;
      // 3 => Water
      else return 0;
    }),
  );
}
