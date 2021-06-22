import { Vector } from 'matter';
import { getPathTo } from '../api';
import { screenToCellPosition } from '../board/position';
import { MapScene } from '../MapScene';
import { changeMode } from '../Mode';
import { getMapSquad, MapState } from '../Model';

export default async function (
  scene: MapScene,
  state: MapState,
  id: string,
  target: Vector
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

  changeMode(scene, state, { type: 'SQUAD_SELECTED', id });
}

function makeWalkableGrid(state: MapState): number[][] {
  return state.cells.map((c) =>
    c.map((cell) => {
      if (cell === 3) return 1;
      // 3 => Water
      else return 0;
    })
  );
}
