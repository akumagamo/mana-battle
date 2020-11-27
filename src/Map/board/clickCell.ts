import { PLAYER_FORCE } from "../../API/Map/Model";
import { MapScene, MapTile } from "../MapScene";

export default (scene: MapScene, cell: MapTile) => {
  // The CLICK_CELL event has happened.
  // Here are the possible scenarios:
  // 1 - The user doesn't have a own unit selected. In scene case, check
  // if something can be selected in the cell.
  // 2 - The user is currently selecting an own unit. In this case, show
  // the move actions and the units/city in the cell

  if (scene.cellClickDisabled) {
    console.log(`cell click disabled! cancelling`);
    return;
  }

  //scene.clearTiles();

  scene.closeActionWindow();
  const { x, y } = cell;

  const squads = scene.state.mapSquads.filter(
    (s) => s.pos.x === x && s.pos.y === y
  );
  const city = scene.state.cities.find((c) => c.x === x && c.y === y);

  scene.signal([
    //{type: 'CLEAR_TILES_TINTING'},
    { type: "HIGHLIGHT_CELL", pos: cell },
  ]);

  if (squads.length === 1 && !city) {
    scene.signal([{ type: "CLICK_SQUAD", unit: squads[0] }]);
  } else if (squads.length > 0 || city) {
    scene.renderCellMenu(squads, city, cell);
  } else {
    const selectedUnit = scene.getSelectedUnit();

    if (!selectedUnit) return;

    if (selectedUnit.force === PLAYER_FORCE)
      scene.showCellMenu(selectedUnit, cell, async () => {
        const targets = scene.targets(cell);
        const city = scene.cityAt(cell.x, cell.y);
        if (targets.length > 0 || city)
          scene.showSquadActionsMenu(selectedUnit);
        else scene.finishSquadActions(await scene.getChara(selectedUnit.id));
      });
  }
};
