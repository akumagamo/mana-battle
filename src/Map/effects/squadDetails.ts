import { MapSquad } from "../../API/Map/Model";
import BoardScene from "../../Board/StaticBoardScene";
import { INVALID_STATE } from "../../errors";
import button from "../../UI/button";
import panel from "../../UI/panel";
import { Unit } from "../../Unit/Model";
import { UnitDetailsBarScene } from "../../Unit/UnitDetailsBarScene";
import { MapScene } from "../MapScene";

export default (scene: MapScene, squad: MapSquad, units: Unit[]) => {
  const leader = Object.values(squad.members).find((m) => m.leader);
  if (!leader) throw new Error(INVALID_STATE);

  let charaStats = scene.add.container(0, 0);
  panel(0, 50, 1080, 340, scene.uiContainer, scene);

  scene.disableInput();
  const details = new UnitDetailsBarScene();
  scene.scene.add("details-bar", details, true);

  const boardScene = new BoardScene(squad, units, 0, 50, 0.7);
  scene.scene.add(`board-squad-${squad.id}`, boardScene, true);
  boardScene.onUnitClick((chara) => {
    charaStats.removeAll();
    const unit = chara.unit;

    details.render(unit);
  });

  boardScene.highlightTile(leader);

  details.render(units.find((u) => u.id === leader.id));

  button(1050, 50, "Close", scene.uiContainer, scene, () => {
    boardScene.destroy(scene);

    if (details) details.destroy(details);

    charaStats.destroy();

    scene.enableInput();
  });
};
