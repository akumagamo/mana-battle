import { MapSquad } from "../../API/Map/Model";
import BoardScene from "../../Board/StaticBoardScene";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { INVALID_STATE } from "../../errors";
import button from "../../UI/button";
import { Unit } from "../../Unit/Model";
import { UnitDetailsBarScene } from "../../Unit/UnitDetailsBarScene";
import { MapScene } from "../MapScene";

export default (scene: MapScene, squad: MapSquad, units: Unit[]) => {
  const leader = Object.values(squad.members).find((m) => m.leader);
  if (!leader) throw new Error(INVALID_STATE);

  let charaStats = scene.add.container(0, 0);

  const backdrop_ = backdrop(scene);

  const container = scene.add.container();

  scene.disableInput();
  const details = new UnitDetailsBarScene(false, false);
  scene.scene.add("details-bar", details, true);
  scene.scene.bringToTop("details-bar");

  const boardScene = new BoardScene(squad, units, 200, 50, 0.7);
  scene.scene.add(`board-squad-${squad.id}`, boardScene, true);
  boardScene.onUnitClick((chara) => {
    charaStats.removeAll();
    const unit = chara.unit;

    details.render(unit);
  });

  boardScene.highlightTile(leader);

  details.render(units.find((u) => u.id === leader.id));

  button(1050, 250, "Close", container, scene, () => {
    boardScene.destroy(scene);

    if (details) details.destroy(details);

    charaStats.destroy();

    backdrop_.destroy();
    scene.enableInput();

    container.destroy();
  });
};

function backdrop(scene: MapScene) {
  const backdrop = scene.add.graphics();
  backdrop.fillStyle(0x000000, 0.5);
  backdrop.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // let rect = new Phaser.Geom.Rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  // backdrop.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
  // backdrop.on('pointerdown', () => {
  //   backdrop.destroy();
  //   onClose();
  // });
  return backdrop;
}
