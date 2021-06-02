import BoardScene from "../Board/InteractiveBoardScene";
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

const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: "ADD_UNIT_BUTTON_CLICKED",
  ON_DRAG: "ON_DRAG",
  ON_DRAG_END: "ON_DRAG_END",
};

export type EditSquadModalEvents = {
  AddUnitButtonClicked: EventFactory<null>;
  OnDrag: EventFactory<Vector>;
  OnDragEnd: EventFactory<{ pos: Vector; unit: Unit }>;
};

export default function (
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  squad: Squad.SquadRecord,
  units: UnitIndex,
  onSquadUpdated: (s: Squad.SquadRecord, added: string[], removed:string[]) => void,
  onClose: (s: Squad.SquadRecord) => void
) {
  const boardScene = new BoardScene(squad, onSquadUpdated, units, true);
  scene.scene.add("editSquadModalBoard", boardScene, true);
  const listScene = new UnitListScene(
    50,
    75,
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
  };
  events.AddUnitButtonClicked.on(() =>
    handleAddUnitButtonClicked(scene, listScene, boardScene, onSquadUpdated)
  );

  events.OnDrag.on(({ x, y }: { x: number; y: number }) =>
    handleOnDragFromUnitList(boardScene, x, y)
  );
  events.OnDragEnd.on(({ pos, unit }: { pos: Vector; unit: Unit }) =>
    handleOnDragEndFromUnitList(
      pos.x,
      pos.y,
      listScene,
      boardScene,
      unit,
      onSquadUpdated
    )
  );

  const container = scene.add.container();
  panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);
  let details: Container | null = null;

  boardScene.makeUnitsClickable((c) => {
    details?.destroy();
    details = SmallUnitDetailsBar(
      10,
      SCREEN_HEIGHT - 100,
      scene,
      units.find((u) => u.id === c.props.unit.id)
    );
    container.add(details);
  });
  button(1100, 300, "Close", container, scene, () => {
    container.destroy();
    boardScene.destroy();
    scene.scene.remove("editSquadModalBoard");
    scene.scene.stop("UnitListScene");

    for (const k in componentEvents) scene.events.off(k);

    onClose(boardScene.squad);
  });
  button(1100, 400, "Add Unit", container, scene, () =>
    events.AddUnitButtonClicked.emit(null)
  );

  return events;
}

export const handleAddUnitButtonClicked = (
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  list: UnitListScene,
  boardScene: BoardScene,
  onSquadUpdated: (s: Squad.SquadRecord, added: string[], removed:string[]) => void
) => {
  list.onDrag = (_unit, x, y) =>
    scene.editSquadModalEvents.OnDrag.emit({ x, y });
  list.onDragEnd = (u, x, y, _chara) =>
    handleOnDragEndFromUnitList(x, y, list, boardScene, u, onSquadUpdated);
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
  onSquadUpdated: (s: Squad.SquadRecord, added: string[], removed: string[]) => void
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

    //remove dragged unit chara
    listScene.removeUnit(unit);
    //create new chara on board, representing same unit
    board.placeUnit({
      member: updatedSquad.members.get(unit.id),
      fromOutside: true,
    });
    //remove replaced unit
    if (unitToReplace) {
      const charaToRemove = board.unitList.find(
        (chara) => chara.props.unit.id === unitToReplace.id
      );

      board.scene.scene.tweens.add({
        targets: charaToRemove?.container,
        y: (charaToRemove?.container?.y || 0) - 200,
        alpha: 0,
        ease: "Cubic",
        duration: 400,
        repeat: 0,
        paused: false,
        yoyo: false,
      });
    }
    board.highlightTile(cell);
  } else {
    // this.unitListScene?.returnToOriginalPosition(unit);
    // this.unitListScene?.scaleDown(chara);
    // boardScene.tiles.forEach((tile) => tile.sprite.clearTint());
  }
};
