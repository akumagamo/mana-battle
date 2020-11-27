import { PLAYER_FORCE } from "../../API/Map/Model";
import { MapScene, MapTile } from "../MapScene";

export default (scene: MapScene, cell: MapTile) => {
  // The CLICK_CELL event has happened.
  // Here are the possible scenarios:
  // 1 - The user doesn't have a own unit selected. In scene case, check
  // if something can be selected in the cell.
  // 2 - The user is currently selecting an own unit. In this case, show
  // the move actions and the units/city in the cell

  //scene.clearTiles();

  scene.closeActionWindow();
  const { x, y } = cell;

  const squads = scene.state.mapSquads.filter(
    (s) => s.pos.x === x && s.pos.y === y
  );
  const city = scene.state.cities.find((c) => c.x === x && c.y === y);

  // TODO: select city if nothing is there
  if (squads.length === 1 && !city) {
    scene.signal("there was just a squad in the cell, select it", [
      { type: "CLICK_SQUAD", unit: squads[0] },
    ]);
  } else if (squads.length > 0 || city) {
    scene.renderCellMenu(squads, city, cell);
  } else {
    const selectedUnit = scene.getSelectedUnit();

    if (!selectedUnit) return;

    if (selectedUnit.force === PLAYER_FORCE)
      scene.showCellMenu(selectedUnit, cell);
  }
};
