import {MapSquad} from '../../API/Map/Model';
import BoardScene from '../../Board/StaticBoardScene';
import button from '../../UI/button';
import panel from '../../UI/panel';
import text from '../../UI/text';
import {Unit} from '../../Unit/Model';
import {UnitDetailsBarScene} from '../../Unit/UnitDetailsBarScene';
import {MapScene} from '../MapScene';

export default (scene: MapScene, squad: MapSquad, units:Unit[]) => {
  let charaStats = scene.add.container(0, 0);
  panel(50, 50, 1080, 540, scene.uiContainer, scene);
  scene.disableCellClick();
  scene.disableCityClick();
  scene.dragDisabled = true;

  let details:UnitDetailsBarScene | null = null;

  const boardScene = new BoardScene(squad,units, 50, 0, 0.7);
  scene.scene.add(`board-squad-${squad.id}`, boardScene, true);
  boardScene.onUnitClick((chara) => {
    charaStats.removeAll();
    if(details)
      details.destroy(details);
    details = new UnitDetailsBarScene();

    const unit = chara.unit;

    scene.scene.add('details-bar', details, true);

    details.render(unit);
  });

  button(900, 120, 'Close', scene.uiContainer, scene, () => {
    boardScene.destroy(scene);

    if(details)
      details.destroy(details);

    charaStats.destroy();

    scene.dragDisabled = false;
    // TODO: also enable/disable click on units/cities

    scene.enableCellClick();
    scene.enableCityClick();
    scene.refreshUI();
  });
};
