import BoardScene from "../Board/InteractiveBoardScene";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
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
};

export type EditSquadModalEvents = {
  AddUnitButtonClicked: EventFactory<null>;
};

export default function (
  scene: Phaser.Scene,
  squad: SquadRecord,
  units: UnitIndex,
  onSquadUpdated: (s: SquadRecord) => void,
  onClose: () => void
) {
  const events: EditSquadModalEvents = {
    AddUnitButtonClicked: SceneEventFactory<null>(
      scene,
      componentEvents.ADD_UNIT_BUTTON_CLICKED
    ),
  };
  events.AddUnitButtonClicked.on(() =>
    handleAddUnitButtonClicked(scene, units)
  );

  const container = scene.add.container();
  panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);
  let details: Container | null = null;
  const boardScene = new BoardScene(squad, onSquadUpdated, units, true);

  scene.scene.add("editSquadModalBoard", boardScene, true);
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
  scene: Phaser.Scene,
  units: UnitIndex
) => {
  const list = new UnitListScene(50, 75, 5, units);
  scene.scene.add("UnitListScene", list, true);
};
