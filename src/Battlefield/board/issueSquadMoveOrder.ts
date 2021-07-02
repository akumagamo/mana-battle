import { PLAYER_FORCE } from "../../constants";
import { getChara, getMapSquad, MapState, Vector } from "../Model";
import { screenToCellPosition } from "./position";
import moveSquadTo from "../squads/moveSquadTo";
import signal from "../signal";
import { changeMode } from "../Mode";
import run from "../../Chara/animations/run";

export async function issueSquadMoveOrder(
  scene: Phaser.Scene,
  state: MapState,
  { x, y }: Vector,
  id: string
) {
  const squad = getMapSquad(state, id);
  if (squad && squad.squad.force === PLAYER_FORCE) {
    state.isPaused = false;

    const cell = screenToCellPosition(squad.pos);

    if (cell.x !== x || cell.y !== y) {
      await moveSquadTo(scene, state, id, { x, y });
      state.squads = state.squads.update(id, (sqd) => ({
        ...sqd,
        status: "moving",
      }));
      const chara = getChara(state, id);
      run(chara);
      signal(scene, state, "squad moved, updating position", [
        { type: "UPDATE_SQUAD_POS", id, pos: { x, y } },
      ]);
    } else {
      changeMode(scene, state, { type: "SQUAD_SELECTED", id });
    }
  }
}
