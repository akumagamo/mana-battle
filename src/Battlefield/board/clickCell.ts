import { MapScene } from '../MapScene';
import { makeVector } from '../makeVector';
import { PLAYER_FORCE } from '../../constants';
import { getMapSquad, Vector } from '../Model';
import { cellToScreenPosition, screenToCellPosition } from './position';
import SquadClicked from '../events/SquadClicked';
import moveSquadTo from '../squads/moveSquadTo';
import signal from '../signal';
import { refreshUI } from '../ui';
import { getDistance } from '../../utils';
import { changeMode } from '../Mode';

export default async (scene: MapScene, cell: Vector) => {
  const { x, y } = cell;

  const mapSquad = squadAt(scene, x, y);

  const select = () => {
    if (mapSquad) {
      changeMode(scene, { type: 'SQUAD_SELECTED', id: mapSquad.squad.id });
      SquadClicked(scene).emit(mapSquad);
      return;
    }

    const city = scene.state.cities.find((c) => c.x === x && c.y === y);

    if (city) {
      const selectCity = () => {
        signal(scene, 'there was just a squad in the cell, select it', [
          { type: 'SELECT_CITY', id: city.id },
        ]);
        changeMode(scene, { type: 'CITY_SELECTED', id: city.id });
      };
      switch (scene.state.mode.type) {
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

  switch (scene.state.mode.type) {
    case 'MOVING_SQUAD':
      await handleMovingSquad(scene, x, y, scene.state.mode.id);
      break;
    case 'SELECT_SQUAD_MOVE_TARGET':
      await handleSelectSquadMoveTarget(scene, x, y, scene.state.mode.id);
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
  const selectedSquad = getMapSquad(scene.state, id);

  if (selectedSquad && selectedSquad.squad.force === PLAYER_FORCE) {
    const isWalkable = scene.state.moveableCells.has(makeVector({ x, y }));

    if (isWalkable) {
      await moveSquadTo(scene, selectedSquad.squad.id, { x, y });
      signal(scene, 'squad moved, updating position', [
        { type: 'UPDATE_SQUAD_POS', id, pos: { x, y } },
      ]);
      refreshUI(scene);
    }
  }
}

async function handleSelectSquadMoveTarget(
  scene: MapScene,
  x: number,
  y: number,
  id: string
) {
  const selectedSquad = getMapSquad(scene.state, id);
  if (selectedSquad && selectedSquad.squad.force === PLAYER_FORCE) {
    scene.state.isPaused = false;

    const cell = screenToCellPosition(selectedSquad.pos);

    if (cell.x !== x || cell.y !== y) {
      await moveSquadTo(scene, selectedSquad.squad.id, { x, y });
      scene.state.squads = scene.state.squads.update(id, (sqd) => ({
        ...sqd,
        status: 'moving',
      }));
      signal(scene, 'squad moved, updating position', [
        { type: 'UPDATE_SQUAD_POS', id, pos: { x, y } },
      ]);
    } else {
      changeMode(scene, { type: 'SQUAD_SELECTED', id });
    }
  }
}

function squadAt(scene: MapScene, x: number, y: number) {
  return scene.state.dispatchedSquads
    .map((id) => getMapSquad(scene.state, id))
    .find((s) => getDistance(cellToScreenPosition({ x, y }), s.pos) < 50);
}
