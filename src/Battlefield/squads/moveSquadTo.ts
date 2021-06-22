import { Vector } from "matter";
import { getPathTo } from "../api";
import { screenToCellPosition } from "../board/position";
import { MapScene } from "../MapScene";
import { getMapSquad } from "../Model";

export default async function (scene: MapScene, id: string, target: Vector) {
  const squad = getMapSquad(scene.state, id);

  const grid = makeWalkableGrid(scene);

  const startCell = screenToCellPosition(squad.pos);
  const [, ...path] = getPathTo(grid)(startCell)(target).map(([x, y]) => ({
    x,
    y,
  }));

  scene.squadsInMovement = scene.squadsInMovement.set(id, {
    path,
    squad,
  });

  scene.changeMode({ type: "SQUAD_SELECTED", id });
}

function makeWalkableGrid(scene: MapScene): number[][] {
  return scene.state.cells.map((c) =>
    c.map((cell) => {
      if (cell === 3) return 1;
      // 3 => Water
      else return 0;
    })
  );
}
