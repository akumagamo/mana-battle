import BoardScene from "../Board/InteractiveBoardScene";
import { Chara } from "../Chara/Chara";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
import { Vector } from "../Map/Model";
import { Container } from "../Models";
import button from "../UI/button";
import panel from "../UI/panel";
import { Unit, UnitIndex } from "../Unit/Model";
import SmallUnitDetailsBar from "../Unit/SmallUnitDetailsBar";
import UnitListScene from "../Unit/UnitListScene";
import { SceneEventFactory, EventFactory } from "../utils";
import * as Squad from "./Model";

const GAME_SPEED = parseInt(process.env.SPEED);

const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: "ADD_UNIT_BUTTON_CLICKED",
  ON_DRAG: "ON_DRAG",
  ON_DRAG_END: "ON_DRAG_END",
  ON_CLOSE: "ON_CLOSE",
};

export type EditSquadModalEvents = {
  AddUnitButtonClicked: EventFactory<null>;
  OnDrag: EventFactory<Vector>;
  OnDragEnd: EventFactory<{ pos: Vector; unit: Unit }>;
  OnClose: EventFactory<Squad.SquadRecord>;
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
  const boardScene = new BoardScene(squad, onSquadUpdated, units, true);
  scene.scene.add("editSquadModalBoard", boardScene, true);
  const listScene = new UnitListScene(
    110,
    90,
    5,
    units.filter((u) => !u.squad)
  );

  const events: EditSquadModalEvents = {
    AddUnitButtonClicked: SceneEventFactory<null>(
      scene,
      componentEvents.ADD_UNIT_BUTTON_CLICKED
    ),
    OnDrag: SceneEventFactory<Vector>(scene, componentEvents.ON_DRAG),
    OnDragEnd: SceneEventFactory<{ pos: Vector; unit: Unit }>(
      scene,
      componentEvents.ON_DRAG_END
    ),
    OnClose: SceneEventFactory<Squad.SquadRecord>(
      scene,
      componentEvents.ON_CLOSE
    ),
  };
  events.AddUnitButtonClicked.on(() =>
    handleAddUnitButtonClicked(scene, listScene, boardScene, onSquadUpdated)
  );

  events.OnDrag.on(({ x, y }: { x: number; y: number }) =>
    handleOnDragFromUnitList(boardScene, x, y)
  );
  events.OnDragEnd.on(
    ({ pos, unit, chara }: { pos: Vector; unit: Unit; chara: Chara }) =>
      handleOnDragEndFromUnitList(
        pos.x,
        pos.y,
        listScene,
        boardScene,
        unit,
        onSquadUpdated,
        chara
      )
  );
  events.OnClose.on((squad: Squad.SquadRecord) => onClose(squad));

  const container = boardScene.add.container();
  panel(50, 50, SCREEN_WIDTH - 100, SCREEN_HEIGHT - 150, container, boardScene);
  let details: Container | null = null;

  boardScene.makeUnitsClickable((c) => {
    details?.destroy();
    details = SmallUnitDetailsBar(
      330,
      SCREEN_HEIGHT - 180,
      boardScene,
      units.find((u) => u.id === c.props.unit.id)
    );
    container.add(details);
  });
  button(1100, 550, "Confirm", container, boardScene, () => {
    container.destroy();
    scene.scene.stop("UnitListScene");
    boardScene.destroy();

    for (const k in componentEvents) scene.events.off(k);

    onClose(boardScene.squad);
  });
  button(
    1100,
    400,
    "Add Unit",
    container,
    boardScene,
    () => events.AddUnitButtonClicked.emit(null),
    !addUnitEnabled
  );

  return events;
}

export const handleAddUnitButtonClicked = (
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  list: UnitListScene,
  boardScene: BoardScene,
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void
) => {
  list.onDrag = (_unit, x, y) =>
    scene.editSquadModalEvents.OnDrag.emit({ x, y });
  list.onDragEnd = (u, x, y, chara) =>
    handleOnDragEndFromUnitList(
      x,
      y,
      list,
      boardScene,
      u,
      onSquadUpdated,
      chara
    );
  scene.scene.add("UnitListScene", list, true);
};

const handleOnDragFromUnitList = (board: BoardScene, x: number, y: number) => {
  board.tiles.forEach((tile) => tile.sprite.clearTint());
  const boardSprite = board.findTileByXY(x, y);

  if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
};

const handleOnDragEndFromUnitList = (
  x: number,
  y: number,
  listScene: UnitListScene,
  board: BoardScene,
  unit: Unit,
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void,
  chara: Chara
) => {
  const cell = board.findTileByXY(x, y);

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

    //Remove dragged unit from list
    listScene.removeUnit(unit);

    //create new chara on board, representing same unit
    board.placeUnit({
      member: Squad.makeMember({ id: unit.id, x: cell.boardX, y: cell.boardY }),
      fromOutside: true,
    });

    //remove replaced unit
    if (unitToReplace) {
      const charaToRemove = board.unitList.find(
        (chara) => chara.props.unit.id === unitToReplace.id
      );

      listScene.addUnit(charaToRemove.props.unit);

      board.scene.scene.tweens.add({
        targets: charaToRemove.container,
        y: charaToRemove.container.y - 200,
        alpha: 0,
        ease: "Cubic",
        duration: 8400 / GAME_SPEED,
        repeat: 0,
        paused: false,
        yoyo: false,
        onComplete: () => {
          removeCharaFromBoard(board, charaToRemove);
        },
      });
    }

    board.highlightTile(cell);
  } else {
    listScene.returnToOriginalPosition(unit);
    listScene.scaleDown(chara);
    board.tiles.forEach((tile) => tile.sprite.clearTint());
  }
};

function removeCharaFromBoard(board: BoardScene, charaToRemove: Chara) {
  board.unitList = board.unitList.filter(
    (c) => c.props.key !== charaToRemove.props.key
  );
  charaToRemove.scene.remove(charaToRemove);
}

function handleOnClose() {}
