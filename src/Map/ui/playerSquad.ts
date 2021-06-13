import { MapSquad } from '../Model';
import button from '../../UI/button';
import { MapScene } from '../MapScene';
import EditSquadModal from '../../Squad/EditSquadModal';

export default (
  mapScene: MapScene,
  baseY: number,
  mapSquad: MapSquad,
  uiContainer: Phaser.GameObjects.Container
) => {
  const baseX = 300;
  const mode = mapScene.mode.type;

  if (mode === 'SQUAD_SELECTED') {
    button(
      baseX + 400,
      baseY,
      'Formation',
      mapScene.uiContainer,
      mapScene,
      () => {
        mapScene.changeMode({ type: 'CHANGING_SQUAD_FORMATION' });
        mapScene.disableMapInput();

        EditSquadModal(
          mapScene,
          mapSquad.squad,
          mapScene.state.units,
          false,
          (updatedSquad) => {
            mapScene.signal('changed unit position on board, updating', [
              {
                type: 'UPDATE_STATE',
                target: {
                  ...mapScene.state,
                  squads: mapScene.state.squads.set(mapSquad.id, {
                    ...mapScene.state.squads.get(mapSquad.id),
                    squad: updatedSquad,
                  }),
                },
              },
            ]);
          },
          () => {
            mapScene.enableInput();
            mapScene.changeMode({
              type: 'SQUAD_SELECTED',
              id: mapSquad.squad.id,
            });
          }
        );
      }
    );
    button(baseX + 200, baseY, 'Move', mapScene.uiContainer, mapScene, () =>
      mapScene.evs.MovePlayerSquadButonClicked.emit({ mapScene, mapSquad })
    );
  }
};

export function handleMovePlayerSquadButtonClicked({
  mapSquad,
  mapScene,
}: {
  mapScene: MapScene;
  mapSquad: MapSquad;
}) {
  mapScene.changeMode({
    type: 'SELECT_SQUAD_MOVE_TARGET',
    id: mapSquad.id,
    start: mapSquad.pos,
  });
  mapScene.isPaused = true;
}
