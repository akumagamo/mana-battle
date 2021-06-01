import BoardScene from "../Board/InteractiveBoardScene";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
import { Vector } from "../Map/Model";
import { Container } from "../Models";
import button from "../UI/button";
import panel from "../UI/panel";
import { UnitIndex } from "../Unit/Model";
import SmallUnitDetailsBar from "../Unit/SmallUnitDetailsBar";
import UnitListScene from "../Unit/UnitListScene";
import { SceneEventFactory, EventFactory } from "../utils";
import { SquadRecord } from "./Model";

const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: "ADD_UNIT_BUTTON_CLICKED",
  ON_DRAG: "ON_DRAG",
};

export type EditSquadModalEvents = {
  AddUnitButtonClicked: EventFactory<null>;
  OnDrag: EventFactory<Vector>;
};

export default function (
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  squad: SquadRecord,
  units: UnitIndex,
  onSquadUpdated: (s: SquadRecord) => void,
  onClose: () => void
) {
  const boardScene = new BoardScene(squad, onSquadUpdated, units, true);
  scene.scene.add("editSquadModalBoard", boardScene, true);

  const events: EditSquadModalEvents = {
    AddUnitButtonClicked: SceneEventFactory<null>(
      scene,
      componentEvents.ADD_UNIT_BUTTON_CLICKED
    ),
    OnDrag: SceneEventFactory<Vector>(scene, componentEvents.ON_DRAG),
  };
  events.AddUnitButtonClicked.on(() =>
    handleAddUnitButtonClicked(scene, units)
  );

  events.OnDrag.on(({ x, y }: { x: number; y: number }) =>
    handleOnDragFromUnitList(boardScene, x, y)
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

    onClose();
  });
  button(1100, 400, "Add Unit", container, scene, () =>
    events.AddUnitButtonClicked.emit(null)
  );

  return events;
}

export const handleAddUnitButtonClicked = (
  scene: Phaser.Scene & { editSquadModalEvents: EditSquadModalEvents },
  units: UnitIndex
) => {
  const list = new UnitListScene(50, 75, 5, units);
  list.onDrag = (u, x, y) => scene.editSquadModalEvents.OnDrag.emit({ x, y });
  list.onDragEnd = (u, x, y, chara) => console.log(x, y);
  scene.scene.add("UnitListScene", list, true);
};

const handleOnDragFromUnitList = (board: BoardScene, x: number, y: number) => {
  console.log(board.tiles)
  board.tiles.forEach((tile) => tile.sprite.clearTint());
  const boardSprite = board.findTileByXY(x, y);

  if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
};
