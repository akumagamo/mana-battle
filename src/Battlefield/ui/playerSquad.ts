import { MapSquad, MapState } from '../Model';
import button from '../../UI/button';
import { MapScene } from '../MapScene';
import EditSquadModal from '../../Squad/EditSquadModal/createEditSquadModal';
import MovePlayerSquadButtonClicked from '../events/MovePlayerSquadButtonClicked';
import { disableMapInput, enableInput } from '../board/input';
import signal from '../signal';
import { changeMode } from '../Mode';

export default (
  mapScene: MapScene,
  state: MapState,
  baseY: number,
  mapSquad: MapSquad
) => {
  const baseX = 300;
  const mode = state.mode.type;

  if (mode === 'SQUAD_SELECTED') {
    button(baseX + 400, baseY, 'Formation', state.uiContainer, mapScene, () => {
      changeMode(mapScene, state, { type: 'CHANGING_SQUAD_FORMATION' });
      disableMapInput(state);

      EditSquadModal({
        scene: mapScene,
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
          enableInput(mapScene, state);
          changeMode(mapScene, state, {
            type: 'SQUAD_SELECTED',
            id: mapSquad.squad.id,
          });
        },
      });
    });
    button(baseX + 200, baseY, 'Move', state.uiContainer, mapScene, () =>
      MovePlayerSquadButtonClicked(mapScene).emit({ mapScene, state, mapSquad })
    );
  }
};

export function handleMovePlayerSquadButtonClicked({
  mapSquad,
  state,
  mapScene,
}: {
  mapScene: MapScene;
  state: MapState;
  mapSquad: MapSquad;
}) {
  changeMode(mapScene, state, {
    type: 'SELECT_SQUAD_MOVE_TARGET',
    id: mapSquad.id,
    start: mapSquad.pos,
  });
  state.isPaused = true;
}
