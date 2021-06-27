import { PLAYER_FORCE } from '../../constants';
import { getMapSquad, MapState, Vector } from '../Model';
import { cellToScreenPosition, screenToCellPosition } from './position';
import moveSquadTo from '../squads/moveSquadTo';
import signal from '../signal';
import { getDistance } from '../../utils';
import { changeMode } from '../Mode';
import { selectionWindow } from './selectionWindow';

export default async (scene: Phaser.Scene, state: MapState, cell: Vector) => {
  const { x, y } = cell;

  const mapSquads = squadsAt(state, x, y);

  switch (state.uiMode.type) {
    case 'SELECT_SQUAD_MOVE_TARGET':
      await handleSelectSquadMoveTarget(scene, state, x, y, state.uiMode.id);
      break;
    default:
      selectionWindow(mapSquads, scene, state, x, y);
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
        status: 'moving',
      }));
      signal(scene, state, 'squad moved, updating position', [
        { type: 'UPDATE_SQUAD_POS', id, pos: { x, y } },
      ]);
    } else {
      changeMode(scene, state, { type: 'SQUAD_SELECTED', id });
    }
  }
}

function squadsAt(state: MapState, x: number, y: number) {
  return state.dispatchedSquads
    .map((id) => getMapSquad(state, id))
    .filter((s) => getDistance(cellToScreenPosition({ x, y }), s.pos) < 50);
}
