//@ts-nocheck

import TitleScene from './Scenes/TitleScene';
import CharaCreationScene from './CharaCreation/CharaCreationScene';
import { MapScene } from './Map/MapScene';
import { PLAYER_FORCE } from './constants';
import { Unit } from './Unit/Model';
import { ListSquadsScene } from './Squad/ListSquadsScene/ListSquadsScene';
import UnitList from './Unit/UnitList';
import BoardScene from './Board/InteractiveBoardScene';
import { handleDispatchSquad } from './Map/dispatchWindow';
import { MapSquad } from './Map/Model';
import { handleMovePlayerSquadButtonClicked } from './Map/ui/playerSquad';
import { Map } from 'immutable';
import onDrag from './Chara/events/onDrag';
import onUnitDrag from './Board/events/onUnitDrag';
import onDragEnd from './Chara/events/onDragEnd';
import onUnitDragEnd from './Board/events/onUnitDragEnd';

const assert = (condition: string, a: any, b: any) => {
  if (a !== b)
    throw new Error(
      `❌ ${condition} - ${a.toString()} should equals ${b.toString()}`
    );
  else console.log('✅', condition);
};

export function endToEndTesting(game: Phaser.Game) {
  game.events.once('TitleSceneCreated', (scn: TitleScene) => {
    scn.sceneEvents.NewGameButtonClicked();
  });
  game.events.once(
    'CharaCreationSceneCreated',
    (
      scn: CharaCreationScene,
      onHeroCreated: (value: Unit | PromiseLike<Unit>) => void
    ) => {
      (document.getElementById('new-chara-name') as HTMLInputElement).value =
        'TestHero';
      scn.sceneEvents.ConfirmationButtonClicked(onHeroCreated);
    }
  );
  game.events.once('MapSceneCreated', (scn: MapScene) => {
    return;
    const squad = scn.state.squads.find(
      (sqd) => sqd.squad.force === PLAYER_FORCE
    );
    clickCell(scn, 3, 5);
    scn.evs.MovePlayerSquadButonClicked.emit({
      mapScene: scn,
      mapSquad: squad,
    });
    assert("MapScene is paused after clicking 'Move'", scn.isPaused, true);

    clickCell(scn, 7, 5);

    scn.evs.SquadDispatched.once((_id) => {
      assert(
        'MapScene is no longer paused selecting move destination',
        scn.isPaused,
        false
      );
    });

    scn.evs.SquadArrivedInfoMessageCompleted.once((chara) => {
      scn.evs.CloseSquadArrivedInfoMessage.emit(chara);

      scn.evs.MovePlayerSquadButonClicked.emit({
        mapScene: scn,
        mapSquad: squad,
      });

      scn.evs.OrganizeButtonClicked.emit(scn);
    });
  });
  game.events.once(
    'ListSquadsSceneCreated',
    async (listScene: ListSquadsScene) => {
      return;
      EditSquad(listScene);

      SquadCreation(listScene, game);

      game.events.once('MapSceneCreated', (mapScene: MapScene) => {
        mapScene.evs.DispatchWindowRendered.once(
          async ({ squads, container, scene }) => {
            assert(
              'MapScene is paused when dispatch window is rendered',
              scene.isPaused,
              true
            );

            const dispatched = await DispatchSquads(
              squads,
              container,
              scene,
              mapScene
            );
            handleMovePlayerSquadButtonClicked({
              mapScene,
              mapSquad: dispatched,
            });

            clickCell(mapScene, 6, 4);

            mapScene.evs.SquadArrivedInfoMessageCompleted.once((chara) => {
              mapScene.evs.CloseSquadArrivedInfoMessage.emit(chara);
            });
            mapScene.evs.ReturnedFromCombat.once(() => {
              mapScene.evs.SquadArrivedInfoMessageCompleted.once((chara) => {
                mapScene.evs.CloseSquadArrivedInfoMessage.emit(chara);
              });
            });
            console.log('TEST FINISHED');
          }
        );

        mapScene.handleDispatchClick();
      });
    }
  );
}

async function DispatchSquads(
  squads: Map<string, MapSquad>,
  container: Phaser.GameObjects.Container,
  scene: MapScene,
  mapScene: MapScene
) {
  assert('Should render three squads to dispatch', squads.size, 3);

  await handleDispatchSquad(container, scene, squads.first());

  const dispatched = mapScene.state.squads.get((squads.first() as MapSquad).id);

  assert('Dispatch window was destroyed', container.visible, false);
  assert(
    'Selected squad was dispached',
    dispatched.id,
    (squads.first() as MapSquad).id
  );
  assert(
    'MapScene is no longer paused after team is dispatched',
    scene.isPaused,
    false
  );
  return dispatched;
}

function clickCell(scn: MapScene, x: number, y: number) {
  scn.evs.CellClicked.emit({
    tile: { x, y },
    pointer: { x: 200, y: 400 },
  });
}

function EditSquad(listScene: ListSquadsScene) {
  const squad = listScene.squads.toList().get(1);
  listScene.handleSquadClicked(squad);
  listScene.evs.SquadEditClicked.emit(squad);
  const unitListScene = listScene.scene.manager.getScene(
    'UnitListScene'
  ) as UnitList;

  const boardScene = listScene.scene.manager.getScene(
    'BoardScene'
  ) as BoardScene;

  const chara = unitListScene.unitRows[0].chara;

  boardScene.tiles.forEach((t, index) => {
    onDrag(chara, t.sprite.x, t.sprite.y - 100, onUnitDrag(boardScene));
    assert(
      `A unit dragged from the list should paint the board cells when hovered over them (${t.sprite.x}, ${t.sprite.y})`,
      boardScene.tiles[index].sprite.tintTopLeft,
      8978227
    );
    assert(
      'Other tiles should not be tinted',
      boardScene.tiles.every((t, i) => i == index || !t.sprite.isTinted),
      true
    );
  });

  assert(
    'Before adding a character, the squad should have 5 members',
    boardScene.squad.members.size,
    5
  );
  assert(
    'The character is not is not in the squad',
    boardScene.squad.members.has(chara.props.unit.id),
    false
  );
  const getEmptyCell = (board: BoardScene) =>
    board.tiles.find(
      (t) =>
        !boardScene.squad.members.some(
          (m) => m.x === t.boardX && m.y === t.boardY
        )
    );

  // Drag to empty cell
  const emptyCell = getEmptyCell(boardScene);

  onDrag(
    chara,
    emptyCell.sprite.x,
    emptyCell.sprite.y - 100,
    onUnitDrag(boardScene)
  );

  onDragEnd(chara)(emptyCell.sprite.y - 100, onUnitDragEnd(boardScene)(chara));

  assert(
    'After adding a character, the squad should have 6 members',
    boardScene.squad.members.size,
    6
  );
  assert(
    'The dragged character was added to the squad',
    boardScene.squad.members.has(chara.props.unit.id),
    true
  );

  const replacedCharaEid = chara.props.unit.id;

  const newChara = unitListScene.unitRows[0].chara;

  onDrag(
    chara,
    emptyCell.sprite.x,
    emptyCell.sprite.y - 100,
    onUnitDrag(boardScene)
  );
  onDragEnd(chara)(emptyCell.sprite.y - 100, onUnitDragEnd(boardScene)(chara));

  assert(
    'When replacing a character, the number of units is still the same',
    boardScene.squad.members.size,
    6
  );
  assert(
    'The dragged character was added to the squad',
    boardScene.squad.members.has(newChara.props.unit.id),
    true
  );

  assert(
    'The repaced character is no longer in the squad',
    !boardScene.squad.members.has(replacedCharaEid),
    true
  );

  unitListScene.nextPage();
  assert('Should list remaining units', unitListScene.unitRows.length, 3);

  unitListScene.prevPage();
  assert('Should list full page', unitListScene.unitRows.length, 5);

  listScene.editSquadModalEvents.OnClose.emit(null);
}

function SquadCreation(listScene: ListSquadsScene, game: Phaser.Game) {
  listScene.evs.CreateSquadClicked.emit(null);

  const newUnitListScene = game.scene.getScene(
    'UnitListScene'
  ) as UnitList;

  newUnitListScene.nextPage();

  const newBoardScene = game.scene.getScene('BoardScene') as BoardScene;

  [0, 0, 0].forEach((_, index) => {
    const chara_ = newUnitListScene.unitRows[0].chara;

    onDrag(
      chara_,
      newBoardScene.tiles[index].sprite.x,
      newBoardScene.tiles[index].sprite.y - 100,
      onUnitDrag(newBoardScene)
    );
    onDragEnd(chara_)(
      newBoardScene.tiles[index].sprite.y - 100,
      onUnitDragEnd(newBoardScene)(chara_)
    );
  });

  assert(
    'Should move to previous page if current page became empty',
    newUnitListScene.unitRows.length,
    5
  );

  listScene.editSquadModalEvents.OnClose.emit(null);
  listScene.evs.ConfirmButtonClicked.emit(null);
}
