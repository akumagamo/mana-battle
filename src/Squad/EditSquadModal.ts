import BoardScene from "../Board/InteractiveBoardScene";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
import { Container } from "../Models";
import button from "../UI/button";
import panel from "../UI/panel";
import { UnitIndex } from "../Unit/Model";
import SmallUnitDetailsBar from "../Unit/SmallUnitDetailsBar";
import { SquadRecord } from "./Model";

export default function (
  scene: Phaser.Scene,
  squad: SquadRecord,
  units: UnitIndex,
  onSquadUpdated: (s: SquadRecord) => void,
  onClose: () => void
) {
  const container = scene.add.container();
  panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene);
  let details: Container | null = null;
  const boardScene = new BoardScene(squad, onSquadUpdated, units, true);

  scene.scene.add("ediSquadModal", boardScene, true);
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
    scene.scene.remove("ediSquadModal");
    onClose();
  });
}
