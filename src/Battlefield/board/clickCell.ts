import { PLAYER_FORCE } from "../../constants";
import { getMapSquad, MapState, Vector } from "../Model";
import { cellToScreenPosition, screenToCellPosition } from "./position";
import SquadClicked from "../events/SquadClicked";
import moveSquadTo from "../squads/moveSquadTo";
import signal from "../signal";
import { getDistance } from "../../utils";
import { changeMode } from "../Mode";
import selectCityCommand from "../commands/selectCityCommand";

export default async (scene: Phaser.Scene, state: MapState, cell: Vector) => {
  const { x, y } = cell;

  const mapSquad = squadAt(state, x, y);

  const select = () => {
    if (mapSquad) {
      changeMode(scene, state, {
        type: "SQUAD_SELECTED",
        id: mapSquad.squad.id,
      });
      SquadClicked(scene).emit(mapSquad);
      return;
    }

    const city = state.cities.find((c) => c.x === x && c.y === y);

    if (city) selectCityCommand(scene, state)(city);
  };

  switch (state.uiMode.type) {
    case "SELECT_SQUAD_MOVE_TARGET":
      await handleSelectSquadMoveTarget(scene, state, x, y, state.uiMode.id);
      break;
    default:
      select();
  }
};

async function handleSelectSquadMoveTarget(
  scene: Phaser.Scene,
  state: MapState,
  x: number,
  y: number,
  id: string
) {
  const selectedSquad = getMapSquad(state, id);
  if (selectedSquad && selectedSquad.squad.force === PLAYER_FORCE) {
    state.isPaused = false;

    const cell = screenToCellPosition(selectedSquad.pos);

    if (cell.x !== x || cell.y !== y) {
      await moveSquadTo(scene, state, selectedSquad.squad.id, { x, y });
      state.squads = state.squads.update(id, (sqd) => ({
        ...sqd,
        status: "moving",
      }));
      signal(scene, state, "squad moved, updating position", [
        { type: "UPDATE_SQUAD_POS", id, pos: { x, y } },
      ]);
    } else {
      changeMode(scene, state, { type: "SQUAD_SELECTED", id });
    }
  }
}

function squadAt(state: MapState, x: number, y: number) {
  return state.dispatchedSquads
    .map((id) => getMapSquad(state, id))
    .find((s) => getDistance(cellToScreenPosition({ x, y }), s.pos) < 50);
}
