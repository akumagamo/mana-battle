import createBoard from "../../Board/createBoard";
import onBoardUnitClicked from "../../Board/events/onBoardUnitClicked";
import { Board } from "../../Board/Model";
import onEnableDrag from "../../Chara/events/onEnableDrag";
import { Chara } from "../../Chara/Model";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants";
import { Container } from "../../Models";
import button from "../../UI/button";
import panel from "../../UI/panel";
import { Unit, UnitIndex } from "../../Unit/Model";
import SmallUnitDetailsBar from "../../Unit/SmallUnitDetailsBar";
import createUnitList from "../../Unit/UnitList/createUnitList";
import { UnitList } from "../../Unit/UnitList/Model";
import { SceneEventFactory } from "../../utils";
import * as Squad from "../Model";
import onDragEndFromUnitList from "./events/onDragEndFromUnitList";
import onDragFromUnitList from "./events/onDragFromUnitList";
import { onCloseModal } from "./events/onCloseModal";
import { List } from "immutable";
import handleUnitDrag from "../../Unit/UnitList/actions/handleUnitDrag";

export const componentEvents = {
  ADD_UNIT_BUTTON_CLICKED: "ADD_UNIT_BUTTON_CLICKED",
  ON_DRAG: "ON_DRAG",
  ON_DRAG_END: "ON_DRAG_END",
  ON_CLOSE: "ON_CLOSE",
};

export default function ({
  scene,
  squad,
  units,
  addUnitEnabled,
  onSquadUpdated,
  onClose,
}: {
  /** Any scene that wants to use this component needs to register events locally */
  scene: Phaser.Scene;
  squad: Squad.SquadRecord;
  units: UnitIndex;
  addUnitEnabled: boolean;
  onSquadUpdated: (
    s: Squad.SquadRecord,
    added: string[],
    removed: string[]
  ) => void;
  onClose: (s: Squad.SquadRecord) => void;
}) {
  const container = scene.add.container();

  const { board, interactions } = createBoard(
    scene,
    squad,
    units,
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 4,
    1,
    true,
    false,
    {
      onDragStart: () => {},
      onDragEnd: () => () => {},
      onSquadUpdated: onSquadUpdated,
    }
  );

  container.add(board.container);

  const onDragFromUnitListEvent = (
    unit: Unit,
    x: number,
    y: number,
    chara: Chara
  ) => {
    handleUnitDrag(unitList, unit, x, y, chara, () => {
      onDragFromUnitList(board, x, y);
    });
  };

  const onDragEndFromUnitListEvent = (chara: Chara) => (
    x: number,
    y: number
  ) => {
    onDragEndFromUnitList(
      x,
      y,
      unitList,
      board,
      chara,
      onSquadUpdated,
      onListUpdated,
      interactions
    );
  };

  const onListUpdated = (charas: List<Chara>) => {
    charas.forEach((chara) => {
      onEnableDrag(chara, onDragFromUnitListEvent, onDragEndFromUnitListEvent);
    });
  };

  const unitList = createUnitList(
    scene,
    30,
    30,
    5,
    units.toList().filter((u) => !u.squad),
    onListUpdated
  );

  container.add(unitList.container);

  if (!addUnitEnabled) unitList.container.destroy();

  const onCloseEvent = createOnCloseEvent(
    container,
    scene,
    board,
    unitList,
    onClose
  );

  const panel_ = panel(
    0,
    0,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    container,
    board.scene
  );
  container.sendToBack(panel_);

  onBoardUnitClicked(board, (c) => {
    let details = container.getByName("details");

    details?.destroy();

    details = SmallUnitDetailsBar(
      300,
      SCREEN_HEIGHT - 200,
      board.scene,
      units.find((u) => u.id === c.props.unit.id)
    );
    container.add(details);
  });
  button(
    SCREEN_WIDTH - 200,
    SCREEN_HEIGHT - 200,
    "Confirm",
    container,
    board.scene,
    () => onCloseEvent.emit(null)
  );

  board.scene.events.emit("EditSquadModalOpened", { board, unitList });
}

function createOnCloseEvent(
  container: Container,
  scene: Phaser.Scene,
  boardScene: Board,
  listScene: UnitList,
  onClose: { (s: Squad.SquadRecord): void; (arg0: Squad.SquadRecord): void }
) {
  const onClose_ = SceneEventFactory<null>(scene, componentEvents.ON_CLOSE);

  onClose_.on(() => {
    onCloseModal(container, listScene, boardScene, scene, onClose);
  });

  return onClose_;
}
