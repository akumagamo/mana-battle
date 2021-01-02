import {MapScene, MapTile} from '../MapScene';
import {getDistance} from '../../utils';
import {makeVector} from '../makeVector';
import {CPU_FORCE, PLAYER_FORCE} from '../../constants';

export default async (scene: MapScene, cell: MapTile) => {
  const {x, y} = cell;

  const squad = scene.squadAt(x, y);

  const city = scene.state.cities.find((c) => c.x === x && c.y === y);

  const select = () => {
    if (squad) {
      scene.changeMode({type: 'SQUAD_SELECTED', id: squad.id});
      scene.signal('there was just a squad in the cell, select it', [
        {type: 'CLICK_SQUAD', unit: squad},
      ]);
      return;
    }

    if (city) {
      const selectCity = () => {
        scene.signal('there was just a squad in the cell, select it', [
          {type: 'SELECT_CITY', id: city.id},
        ]);
        scene.changeMode({type: 'CITY_SELECTED', id: city.id});
      };
      switch (scene.mode.type) {
        case 'NOTHING_SELECTED':
          return selectCity();
        case 'CITY_SELECTED':
          return selectCity();
        case 'SQUAD_SELECTED':
          return selectCity();
        default:
          return;
      }
    }
  };

  switch (scene.mode.type) {
    case 'MOVING_SQUAD':
      const {id} = scene.mode;
      const selectedSquad = scene.getSquad(id);

      if (selectedSquad && selectedSquad.force === PLAYER_FORCE) {
        const isWalkable = scene.moveableCells.has(makeVector({x, y}));

        if (isWalkable) {
          await scene.moveSquadTo(selectedSquad.id, {x, y});
          scene.signal('squad moved, updating position', [
            {type: 'UPDATE_SQUAD_POS', id, pos: {x, y}},
          ]);
          scene.refreshUI();
        }
      }
      break;
    case 'SELECTING_ATTACK_TARGET':
      if (
        squad &&
        squad.force === CPU_FORCE &&
        getDistance(squad.pos, scene.getSquad(scene.mode.id).pos) === 1
      )
        scene.attackEnemySquad(scene.getSelectedSquad(), scene.squadAt(x, y));
      break;
    default:
      select();
  }
};
