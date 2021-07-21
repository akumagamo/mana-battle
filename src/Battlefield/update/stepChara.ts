import { Chara } from "../../Chara/Model";
import { GAME_SPEED } from "../../env";
import { screenToCellPosition } from "../board/position";
import { MOVE_SPEED } from "../config";
import { MapSquad, MapState, walkableTilesWeightsMap } from "../Model";

export default function (
  state: MapState,
  next: { x: number; y: number },
  squad: MapSquad,
  chara: Chara
): void {
  const currentCell = screenToCellPosition(squad.posScreen);

  const terrainType = state.cells[currentCell.y][currentCell.x];

  const speedModifier = walkableTilesWeightsMap.get(terrainType) || 1;

  const moveSpeed = MOVE_SPEED / speedModifier;

  if (next.x > squad.posScreen.x) {
    const targetStep = squad.posScreen.x + moveSpeed * GAME_SPEED;

    if (targetStep > next.x) squad.posScreen.x = next.x;
    else squad.posScreen.x = targetStep;

    chara.innerWrapper.scaleX = 1;
  } else if (next.x < squad.posScreen.x) {
    const targetStep = squad.posScreen.x - moveSpeed * GAME_SPEED;
    if (targetStep < next.x) squad.posScreen.x = next.x;
    else squad.posScreen.x = targetStep;
    chara.innerWrapper.scaleX = -1;
  } else if (next.y > squad.posScreen.y) {
    const targetStep = squad.posScreen.y + moveSpeed * GAME_SPEED;
    if (targetStep > next.y) squad.posScreen.y = next.y;
    else squad.posScreen.y = targetStep;
  } else if (next.y < squad.posScreen.y) {
    const targetStep = squad.posScreen.y - moveSpeed * GAME_SPEED;
    if (targetStep < next.y) squad.posScreen.y = next.y;
    else squad.posScreen.y = targetStep;
  }
  chara.container.setPosition(squad.posScreen.x, squad.posScreen.y);
  state.squads = state.squads.set(squad.id, squad);
}
