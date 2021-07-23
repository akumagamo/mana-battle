import { PLAYER_FORCE } from "../../constants";
import { getChara, getMapSquad, MapState, Vector } from "../Model";
import { screenToCellPosition } from "./position";
import moveSquadTo from "../squads/moveSquadTo";
import { changeMode } from "../Mode";

export async function issueSquadMoveOrder(
  scene: Phaser.Scene,
  state: MapState,
  { x, y }: Vector,
  id: string
) {
  const squad = getMapSquad(state, id);

  if (squad && squad.squad.force === PLAYER_FORCE) {
    state.isPaused = false;

    const cell = screenToCellPosition(squad.posScreen);

    if ((cell.x !== x || cell.y !== y) && state.cells[y][x] !== 3) {
      moveSquadTo(state, id, { x, y });
      state.squads = state.squads.setIn([id, "status"], "moving");
      const chara = getChara(state, id);
      //animateSquadRun(chara);

      changeMode(scene, state, { type: "NOTHING_SELECTED" });
    } else {
      changeMode(scene, state, { type: "SQUAD_SELECTED", id });
    }
  }
}
