import {MapSquad} from '../../API/Map/Model';
import BoardScene from '../../Board/InteractiveBoardScene';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../../constants';
import {Container} from '../../Models';
import button from '../../UI/button';
import panel from '../../UI/panel';
import SmallUnitDetailsBar from '../../Unit/SmallUnitDetailsBar';
import {MapScene} from '../MapScene';

export default (
  scene: MapScene,
  baseY: number,
  squad: MapSquad,
  uiContainer: Phaser.GameObjects.Container,
) => {
  const mode = scene.mode.type;
  if (mode !== 'MOVING_SQUAD' && mode !== 'SELECTING_ATTACK_TARGET')
    button(
      100,
      baseY,
      'Move',
      scene.uiContainer,
      scene,
      () => {
        scene.showMoveControls(squad);
      },
      scene.movedSquads.has(squad.id),
    );

  if (mode !== 'SELECTING_ATTACK_TARGET') {
    button(
      200,
      baseY,
      'Attack',
      scene.uiContainer,
      scene,
      () => {
        scene.showAttackControls(squad);
      },
      scene.getTargets(squad.pos).length < 1,
    );
  }

  if (mode === 'SQUAD_SELECTED')
    button(300, baseY, 'Formation', scene.uiContainer, scene, () => {
      scene.changeMode({type: 'CHANGING_SQUAD_FORMATION'});
      scene.refreshUI();
      const container = scene.add.container();
      panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);
      let details: Container | null = null;
      const boardScene = new BoardScene(squad, (updatedSquad) =>
        scene.signal('changed unit position on board, updating', [
          {
            type: 'UPDATE_STATE',
            target: {
              ...scene.state,
              mapSquads: scene.state.mapSquads.map((sqd) => {
                if (sqd.id === updatedSquad.id)
                  return {
                    ...sqd,
                    members: updatedSquad.members,
                  };
                else return sqd;
              }),
            },
          },
        ]),
      );

      scene.scene.add('editSquadInMap', boardScene, true);
      scene.disableMapInput();
      boardScene.makeUnitsClickable((c) => {
        details?.destroy();
        details = SmallUnitDetailsBar(10, SCREEN_HEIGHT - 100, scene, c.unit);
        container.add(details);
      });
      button(1100, 300, 'Return', container, scene, () => {
        scene.enableInput();
        boardScene.destroy();
        scene.scene.remove('editSquadInMap');
        container.destroy();

        scene.changeMode({type: 'SQUAD_SELECTED', id: squad.id});
        scene.refreshUI();
      });
    });

  if (mode === 'MOVING_SQUAD')
    button(300, baseY, 'Wait', uiContainer, scene, () => {
      scene.signal('clicked "end squad turn"', [
        {type: 'END_SQUAD_TURN', id: squad.id},
      ]);
    });

  if (mode == 'SELECTING_ATTACK_TARGET' || mode === 'MOVING_SQUAD')
    button(1150, baseY, 'Cancel', uiContainer, scene, async () => {
      switch (scene.mode.type) {
        case 'SELECTING_ATTACK_TARGET':
          scene.changeMode({type: 'SQUAD_SELECTED', id: squad.id});
          scene.signal('cancelled squad targeting"', [
            {type: 'CLEAR_TILES_TINTING'},
          ]);
          scene.refreshUI();
          break;
        case 'MOVING_SQUAD':
          const {start, id} = scene.mode;
          await scene.moveSquadTo(squad.id, start);

          scene.signal('cancelled movement"', [
            {type: 'CLEAR_TILES_TINTING'},
            {type: 'HIGHLIGHT_CELL', pos: start},

            {
              type: 'UPDATE_SQUAD_POS',
              id,
              pos: start,
            },
          ]);

          scene.changeMode({type: 'SQUAD_SELECTED', id});

          scene.refreshUI();
          break;
      }
    });

  if (mode === 'SQUAD_SELECTED')
    button(850, baseY, 'Next Ally', uiContainer, scene, () => {
      scene.selectNextAlly();
    });

  if (mode !== 'MOVING_SQUAD' && mode !== 'SELECTING_ATTACK_TARGET')
    button(1150, baseY, 'End Turn', uiContainer, scene, async () => {
      scene.signal('clicked end team turn button', [
        {type: 'END_FORCE_TURN', id: squad.force},
      ]);
    });
};
