import { MapScene } from "../MapScene";
import { makeVector } from "../makeVector";
import { PLAYER_FORCE } from "../../constants";
import { getChara, getMapSquad, MapState, Vector } from "../Model";
import { cellToScreenPosition, screenToCellPosition } from "./position";
import SquadClicked from "../events/SquadClicked";
import moveSquadTo from "../squads/moveSquadTo";
import signal from "../signal";
import { refreshUI } from "../ui";
import { getDistance } from "../../utils";
import { changeMode } from "../Mode";

export default async (scene: MapScene, state: MapState, cell: Vector) => {
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

    if (city) {
      const selectCity = () => {
        signal(scene, state, "there was just a squad in the cell, select it", [
          { type: "SELECT_CITY", id: city.id },
        ]);
        changeMode(scene, state, { type: "CITY_SELECTED", id: city.id });
      };
      switch (state.mode.type) {
        case "NOTHING_SELECTED":
          return selectCity();
        case "CITY_SELECTED":
          return selectCity();
        case "SQUAD_SELECTED":
          return selectCity();
        default:
          return;
      }
    }
  };

  switch (state.mode.type) {
    case "SELECT_SQUAD_MOVE_TARGET":
      await handleSelectSquadMoveTarget(scene, state, x, y, state.mode.id);
      break;
    default:
      select();
  }
};

async function handleMovingSquad(
  scene: MapScene,
  state: MapState,
  x: number,
  y: number,
  id: string
) {
  const selectedSquad = getMapSquad(state, id);

  if (selectedSquad && selectedSquad.squad.force === PLAYER_FORCE) {
    const isWalkable = state.moveableCells.has(makeVector({ x, y }));

    if (isWalkable) {
      await moveSquadTo(scene, state, selectedSquad.squad.id, { x, y });
      signal(scene, state, "squad moved, updating position", [
        { type: "UPDATE_SQUAD_POS", id, pos: { x, y } },
      ]);
      console.time('ui')
      refreshUI(scene, state);
      console.timeEnd('ui')
    }
  }
}

async function handleSelectSquadMoveTarget(
  scene: MapScene,
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
