import createStaticBoard from '../Board/createBoard';
import onBoardUnitClicked from '../Board/events/onBoardUnitClicked';
import findTileByXY from '../Board/findTileByXY';
import highlightTile from '../Board/highlightTile';
import { StaticBoard } from '../Board/Model';
import { Chara } from '../Chara/Model';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';
import { Vector } from '../Map/Model';
import { Container } from '../Models';
import button from '../UI/button';
import panel from '../UI/panel';
import { Unit, UnitIndex } from '../Unit/Model';
import SmallUnitDetailsBar from '../Unit/SmallUnitDetailsBar';
import UnitListScene from '../Unit/UnitListScene';
import { SceneEventFactory, EventFactory } from '../utils';
import * as Squad from './Model';

const GAME_SPEED = parseInt(process.env.SPEED);

const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: 'ADD_UNIT_BUTTON_CLICKED',
  ON_DRAG: 'ON_DRAG',
  ON_DRAG_END: 'ON_DRAG_END',
  ON_CLOSE: 'ON_CLOSE',
};

export type EditSquadModalEvents = {
  OnDragFromUnitList: EventFactory<Vector>;
  OnDragEndFromUnitList: EventFactory<{ pos: Vector; unit: Unit }>;
  OnClose: EventFactory<null>;
};

export default function (
  /** Any scene that wants to use this component needs to register events locally */
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  squad: Squad.SquadRecord,
  units: UnitIndex,
  addUnitEnabled: boolean,
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void,
  onClose: (s: Squad.SquadRecord) => void
) {
  const boardScene = createStaticBoard(
    scene,
    squad,
    units,
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 4,
    1,
    true,
    false,
    {
      onDragStart: (u, x, y, chara) => {},
      onDragEnd: (chara) => (x, y) => {},
      onSquadUpdated: onSquadUpdated,
    }
  );

  const listScene = new UnitListScene(
    110,
    90,
    5,
    units.toList().filter((u) => !u.squad)
  );

  if (addUnitEnabled)
    createUnitListOnModal(scene, listScene, boardScene, onSquadUpdated);

  const events: EditSquadModalEvents = createEvents(
    scene,
    boardScene,
    listScene,
    onSquadUpdated
  );

  const handleOnCloseEditSquadModal = () => {
    listScene.destroy();
    scene.scene.remove('UnitListScene');
    boardScene.destroy();

    for (const k in componentEvents) scene.events.off(k);

    onClose(boardScene.squad);
  };
  events.OnClose.on(handleOnCloseEditSquadModal);

  const panel_ = panel(
    -SCREEN_WIDTH / 2,
    -SCREEN_HEIGHT / 4,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    boardScene.container,
    boardScene.scene
  );
  boardScene.container.sendToBack(panel_);
  let details: Container | null = null;

  onBoardUnitClicked(boardScene, (c) => {
    details?.destroy();
    details = SmallUnitDetailsBar(
      330,
      SCREEN_HEIGHT - 160,
      boardScene.scene,
      units.find((u) => u.id === c.props.unit.id)
    );
    boardScene.container.add(details);
  });
  button(
    0,
    SCREEN_HEIGHT - 350,
    'Confirm',
    boardScene.container,
    boardScene.scene,
    () => events.OnClose.emit(null)
  );

  return events;
}

export const createUnitListOnModal = (
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  list: UnitListScene,
  boardScene: StaticBoard,
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void
) => {
  list.onDrag = (_unit, x, y) =>
    scene.editSquadModalEvents.OnDragFromUnitList.emit({ x, y });
  list.onDragEnd = (chara, x, y) =>
    handleOnDragEndFromUnitList(x, y, list, boardScene, chara, onSquadUpdated);
  scene.scene.add('UnitListScene', list, true);
};

const handleOnDragFromUnitList = (board: StaticBoard, x: number, y: number) => {
  board.tiles.forEach((tile) => tile.sprite.clearTint());
  const boardSprite = findTileByXY(board, x, y);

  if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
};

const handleOnDragEndFromUnitList = (
  x: number,
  y: number,
  listScene: UnitListScene,
  board: StaticBoard,
  chara: Chara,
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void
) => {
  const cell = findTileByXY(board, x, y);
  const { unit } = chara.props;

  if (cell) {
    const { updatedSquad, added, removed } = Squad.addMember(
      unit,
      board.squad,
      cell.boardX,
      cell.boardY
    );

    onSquadUpdated(updatedSquad, added, removed);

    const unitToReplace = Squad.getMemberByPosition({
      x: cell.boardX,
      y: cell.boardY,
    })(board.squad);

    board.squad = updatedSquad;

    //create new chara on board, representing same unit
    // board.placeUnit({
    //   member: Squad.makeMember({ id: unit.id, x: cell.boardX, y: cell.boardY }),
    //   fromOutside: true,
    // });

    //remove replaced unit
    if (unitToReplace) {
      const charaToRemove = board.unitList.find(
        (chara) => chara.props.unit.id === unitToReplace.id
      );

      listScene.addUnit(charaToRemove.props.unit);

      board.scene.tweens.add({
        targets: charaToRemove.container,
        y: charaToRemove.container.y - 200,
        alpha: 0,
        ease: 'Cubic',
        duration: 8400 / GAME_SPEED,
        repeat: 0,
        paused: false,
        yoyo: false,
        onComplete: () => {
          removeCharaFromBoard(board, charaToRemove);
        },
      });
    }

    //Remove dragged unit from list
    listScene.removeUnitFromList(unit);

    highlightTile(board, cell);
  } else {
    listScene.returnToOriginalPosition(chara);
    listScene.scaleDown(chara);
    board.tiles.forEach((tile) => tile.sprite.clearTint());
  }
};

function createEvents(
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  boardScene: StaticBoard,
  listScene: UnitListScene,
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void
) {
  const events: EditSquadModalEvents = {
    OnDragFromUnitList: SceneEventFactory<Vector>(
      scene,
      componentEvents.ON_DRAG
    ),
    OnDragEndFromUnitList: SceneEventFactory<{ pos: Vector; unit: Unit }>(
      scene,
      componentEvents.ON_DRAG_END
    ),
    OnClose: SceneEventFactory<null>(scene, componentEvents.ON_CLOSE),
  };

  events.OnDragFromUnitList.on(({ x, y }: { x: number; y: number }) =>
    handleOnDragFromUnitList(boardScene, x, y)
  );
  events.OnDragEndFromUnitList.on(
    ({ pos, chara }: { pos: Vector; unit: Unit; chara: Chara }) =>
      handleOnDragEndFromUnitList(
        pos.x,
        pos.y,
        listScene,
        boardScene,
        chara,
        onSquadUpdated
      )
  );
  return events;
}

function removeCharaFromBoard(board: StaticBoard, charaToRemove: Chara) {
  board.unitList = board.unitList.filter(
    (c) => c.props.unit.id !== charaToRemove.props.unit.id
  );
  charaToRemove.charaWrapper.destroy();
}
