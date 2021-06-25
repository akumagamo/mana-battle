import { MapSquad, MapState } from '../Model';
import button from '../../UI/button';
import EditSquadModal from '../../Squad/EditSquadModal/createEditSquadModal';
import MovePlayerSquadButtonClicked from '../events/MovePlayerSquadButtonClicked';
import { disableMapInput, enableInput } from '../board/input';
import { changeMode } from '../Mode';

export default (
  scene: Phaser.Scene,
  state: MapState,
  baseY: number,
  mapSquad: MapSquad
) => {
  const baseX = 300;
  const mode = state.uiMode.type;

  if (mode === 'SQUAD_SELECTED') {
    button(baseX + 400, baseY, 'Formation', state.uiContainer, scene, () => {
      changeMode(scene, state, { type: 'CHANGING_SQUAD_FORMATION' });
      disableMapInput(state);

      EditSquadModal({
        scene,
        squad: mapSquad.squad,
        units: state.units,
        addUnitEnabled: false,
        onSquadUpdated: (updatedSquad) => {
          state.squads = state.squads.setIn(
            [mapSquad.id, 'squad'],
            updatedSquad
          );
        },
        onClose: () => {
          enableInput(scene, state);
          changeMode(scene, state, {
            type: 'SQUAD_SELECTED',
            id: mapSquad.squad.id,
          });
        },
      });
    });
    button(baseX + 200, baseY, 'Move', state.uiContainer, scene, () =>
      MovePlayerSquadButtonClicked(scene).emit({ scene, state, mapSquad })
    );
  }
};

export function handleMovePlayerSquadButtonClicked({
  mapSquad,
  state,
  scene,
}: {
  scene: Phaser.Scene;
  state: MapState;
  mapSquad: MapSquad;
}) {
  changeMode(scene, state, {
    type: 'SELECT_SQUAD_MOVE_TARGET',
    id: mapSquad.id,
    start: mapSquad.pos,
  });
  state.isPaused = true;
}
