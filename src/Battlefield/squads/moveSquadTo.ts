import { Vector } from "matter";
import { getPathTo } from "../api";
import { animateSquadRun } from "../board/animateSquadRun";
import { screenToCellPosition } from "../board/position";
import { getChara, getMapSquad, MapState } from "../Model";

export default function (state: MapState, id: string, target: Vector) {
  const squad = getMapSquad(state, id);

  const grid = makeWalkableGrid(state);

  const startCell = screenToCellPosition(squad.posScreen);

  const [, ...path] = getPathTo(grid)(startCell)(target).map(([x, y]) => ({
    x,
    y,
  }));

  animateSquadRun(getChara(state, id));

  state.squadsInMovement = state.squadsInMovement.set(id, {
    path,
    squad,
  });
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
