import { PLAYER_FORCE } from '../../constants';
import { getChara, getMapSquad, MapState, Vector } from '../Model';
import { screenToCellPosition } from './position';
import moveSquadTo from '../squads/moveSquadTo';
import signal from '../signal';
import { changeMode } from '../Mode';
import selectCell from './selectCell';
import run from '../../Chara/animations/run';

export default async (scene: Phaser.Scene, state: MapState, cell: Vector) => {
  const { x, y } = cell;

  switch (state.uiMode.type) {
    case 'SELECT_SQUAD_MOVE_TARGET':
      await handleSelectSquadMoveTarget(scene, state, cell, state.uiMode.id);
      break;
    default:
      selectCell(scene, state, cell);
  }
};

async function handleSelectSquadMoveTarget(
  scene: Phaser.Scene,
  state: MapState,
  { x, y }: Vector,
  id: string
) {
  const selectedSquad = getMapSquad(state, id);
  if (selectedSquad && selectedSquad.squad.force === PLAYER_FORCE) {
    state.isPaused = false;

    const cell = screenToCellPosition(selectedSquad.pos);

    if (cell.x !== x || cell.y !== y) {
      await moveSquadTo(scene, state, id, { x, y });
      state.squads = state.squads.update(id, (sqd) => ({
        ...sqd,
        status: 'moving',
      }));
      const chara = getChara(state, id);
      run(chara);
      signal(scene, state, 'squad moved, updating position', [
        { type: 'UPDATE_SQUAD_POS', id, pos: { x, y } },
      ]);
    } else {
      changeMode(scene, state, { type: 'SQUAD_SELECTED', id });
    }
  }
}
