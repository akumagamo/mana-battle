import { MapSquad } from "../../API/Map/Model";
import BoardScene from "../../Board/StaticBoardScene";
import button from "../../UI/button";
import panel from "../../UI/panel";
import { Unit } from "../../Unit/Model";
import { UnitDetailsBarScene } from "../../Unit/UnitDetailsBarScene";
import { MapScene } from "../MapScene";

export default (scene: MapScene, squad: MapSquad, units: Unit[]) => {
  let charaStats = scene.add.container(0, 0);
  panel(50, 50, 1080, 540, scene.uiContainer, scene);

  scene.disableInput();
  const details = new UnitDetailsBarScene();
  scene.scene.add("details-bar", details, true);

  const boardScene = new BoardScene(squad, units, 50, 0, 0.7);
  scene.scene.add(`board-squad-${squad.id}`, boardScene, true);
  boardScene.onUnitClick((chara) => {
    charaStats.removeAll();
    const unit = chara.unit;

    details.render(unit);
  });

  details.render(units[0]);

  button(950, 50, "Close", scene.uiContainer, scene, () => {
    boardScene.destroy(scene);

    if (details) details.destroy(details);

    charaStats.destroy();

    scene.enableInput();
  });
};
