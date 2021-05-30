import { MapScene } from "../MapScene";
import { makeVector } from "../makeVector";
import { PLAYER_FORCE } from "../../constants";
import { Vector } from "../Model";
import { screenToCellPosition } from "./position";

export default async (scene: MapScene, cell: Vector) => {
  const { x, y } = cell;

  const mapSquad = scene.squadAt(x, y);

  const select = () => {
    if (mapSquad) {
      scene.changeMode({ type: "SQUAD_SELECTED", id: mapSquad.squad.id });
      scene.evs.SquadClicked.emit(mapSquad);
      return;
    }

    const city = scene.state.cities.find((c) => c.x === x && c.y === y);

    if (city) {
      const selectCity = () => {
        scene.signal("there was just a squad in the cell, select it", [
          { type: "SELECT_CITY", id: city.id },
        ]);
        scene.changeMode({ type: "CITY_SELECTED", id: city.id });
      };
      switch (scene.mode.type) {
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

  switch (scene.mode.type) {
    case "MOVING_SQUAD":
      await handleMovingSquad(scene, x, y, scene.mode.id);
      break;
    case "SELECT_SQUAD_MOVE_TARGET":
      await handleSelectSquadMoveTarget(scene, x, y, scene.mode.id);
      break;
    default:
      select();
  }
};

async function handleMovingSquad(
  scene: MapScene,
  x: number,
  y: number,
  id: string
) {
  const selectedSquad = scene.getSquad(id);

  if (selectedSquad && selectedSquad.squad.force === PLAYER_FORCE) {
    const isWalkable = scene.moveableCells.has(makeVector({ x, y }));

    if (isWalkable) {
      await scene.moveSquadTo(selectedSquad.squad.id, { x, y });
      scene.signal("squad moved, updating position", [
        { type: "UPDATE_SQUAD_POS", id, pos: { x, y } },
      ]);
      scene.refreshUI();
    }
  }
}

async function handleSelectSquadMoveTarget(
  scene: MapScene,
  x: number,
  y: number,
  id: string
) {
  const selectedSquad = scene.getSquad(id);
  if (selectedSquad && selectedSquad.squad.force === PLAYER_FORCE) {
    const cell = screenToCellPosition({ x, y });
    await scene.moveSquadTo(selectedSquad.squad.id, { x, y });
    scene.signal("squad moved, updating position", [
      { type: "UPDATE_SQUAD_POS", id, pos: { x, y } },
    ]);
    scene.refreshUI();
  }
}
