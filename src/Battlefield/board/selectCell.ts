import { getMapSquad, MapSquad, MapState, Vector } from "../Model";
import SquadClicked from "../events/SquadClicked";
import { changeMode } from "../Mode";
import selectCityCommand from "../commands/selectCityCommand";
import { renderSelectionWindow } from "./renderSelectionWindow";
import { getDistance } from "../../utils";
import { cellToScreenPosition } from "./position";

export default function selectCell(
  scene: Phaser.Scene,
  state: MapState,
  { x, y }: Vector
) {
  const mapSquads = squadsAt(state, x, y);
  const city = state.cities.find((c) => c.x === x && c.y === y);

  const selectSquad = (squad: MapSquad) => {
    changeMode(scene, state, {
      type: "SQUAD_SELECTED",
      id: squad.squad.id,
    });
    SquadClicked(scene).emit(squad);
  };
  if (mapSquads.size < 1 && !city) {
    return;
  } else if (cellWithoutSquads() && city) {
    selectCityCommand(scene, state, city);
  } else if (cellWithJustASquad()) {
    const mapSquad = mapSquads.first() as MapSquad;
    selectSquad(mapSquad);
  } else {
    renderSelectionWindow(state, scene, mapSquads, city, selectSquad);
  }

  function cellWithJustASquad() {
    return mapSquads.size === 1 && !city;
  }

  function cellWithoutSquads() {
    return mapSquads.size === 0;
  }
}

function squadsAt(state: MapState, x: number, y: number) {
  return state.dispatchedSquads
    .map((id) => getMapSquad(state, id))
    .filter((s) => getDistance(cellToScreenPosition({ x, y }), s.pos) < 50);
}
