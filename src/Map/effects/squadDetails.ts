import { Scene } from "phaser";
import { MapSquad } from "../../API/Map/Model";
import BoardScene from "../../Board/StaticBoardScene";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { INVALID_STATE } from "../../errors";
import { Container } from "../../Models";
import button from "../../UI/button";
import { Unit } from "../../Unit/Model";
import SmallUnitDetailsBar from "../../Unit/SmallUnitDetailsBar";
import { MapScene } from "../MapScene";

export default (
  scene: MapScene,
  squad: MapSquad,
  units: Unit[],
  onClose: () => void
) => {
  const leader = Object.values(squad.members).find((m) => m.leader);
  if (!leader) throw new Error(INVALID_STATE);

  let charaStats = scene.add.container(0, 0);

  const backdrop_ = backdrop(scene);

  const container = scene.add.container();

  let details: Container | null = null;

  const detailsBar = renderUnitDetailsBar(scene, details, container);

  const boardScene = new BoardScene(squad, units, 200, 50, 0.7);
  scene.scene.add(`board-squad-${squad.id}`, boardScene, true);
  boardScene.onUnitClick((chara) => {
    charaStats.removeAll();

    detailsBar(chara.unit);
  });

  boardScene.highlightTile(leader);

  const defaultUnit = units.find((u) => u.id === leader.id);

  detailsBar(defaultUnit);

  button(1050, 250, "Close", container, scene, () => {
    boardScene.destroy(scene);
    charaStats.destroy();
    backdrop_.destroy();
    container.destroy();

    onClose();
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

function renderUnitDetailsBar(
  scene: Scene,
  details: Container,
  parent: Container
) {
  return function (unit: Unit) {
    details?.destroy();
    details = SmallUnitDetailsBar(10, 500, scene, unit);
    parent.add(details);
  };
}
