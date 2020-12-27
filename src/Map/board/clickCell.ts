import {PLAYER_FORCE} from '../../API/Map/Model';
import {MapScene, MapTile} from '../MapScene';
import {fromJS} from 'immutable';

export default async (scene: MapScene, cell: MapTile) => {
  // The CLICK_CELL event has happened.
  // Here are the possible scenarios:
  // 1 - The user doesn't have a own unit selected. In scene case, check
  // if something can be selected in the cell.
  // 2 - The user is currently selecting an own unit. In this case, show
  // the move actions and the units/city in the cell

  //scene.clearTiles();

  //scene.closeActionWindow();
  const {x, y} = cell;

  const select = () => {
    const squad = scene.squadAt(x, y);

    if (!squad) return;

    scene.changeMode({type: 'SQUAD_SELECTED', id: squad.id});
    scene.signal('there was just a squad in the cell, select it', [
      {type: 'CLICK_SQUAD', unit: squad},
    ]);
  };
  // const city = scene.state.cities.find((c) => c.x === x && c.y === y);

  console.log(`clicked on cell, mode is `, scene.mode.type);
  switch (scene.mode.type) {
    case 'MOVING_SQUAD':
      const selectedSquad = scene.getSelectedSquad();

      if (selectedSquad && selectedSquad.force === PLAYER_FORCE) {
        const isWalkable = scene.moveableCells.has(fromJS({x, y}));

        if (isWalkable) {
          await scene.moveSquadTo(selectedSquad.id, {x, y});

          scene.signal('squad moved, updating position', [
            {type: 'UPDATE_SQUAD_POS', id: selectedSquad.id, pos: {x, y}},
          ]);
        }
      }
      break;
    case 'SELECTING_ATTACK_TARGET':
      scene.attackEnemySquad(scene.getSelectedSquad(), scene.squadAt(x, y));
      break;
    default:
      select();
  }

  // if (path) {
  //   scene.signal('squad moved, updating position', [
  //     {type: 'UPDATE_SQUAD_POS', id: selectedSquad.id, pos: {x, y}},
  //   ]);
  // }

  // }
  // else if (city) {
  //   scene.renderCellMenu(squads, city, cell);

  // } else {
  //   const selectedUnit = scene.getSelectedUnit();

  //   if (!selectedUnit) return;

  //   if (selectedUnit.force === PLAYER_FORCE)
  //     scene.showCellMenu(selectedUnit, cell);
  // }
};
