import { createImage } from '../../Browser/phaser';
import { City, MapState } from '../Model';
import { refreshUI } from '../ui';
import deselectAllEntities from './deselectAllEntities';

const selectCityCommand = (
  scene: Phaser.Scene,
  state: MapState,
  city: City
) => {
  state.uiMode = { type: 'CITY_SELECTED', id: city.id };

  deselectAllEntities(state);

  createSelectedCityIndicator(state, city, scene);

  refreshUI(scene, state);
};

export default selectCityCommand;

function createSelectedCityIndicator(
  state: MapState,
  city: City,
  scene: Phaser.Scene
) {
  const city_ = state.citySprites.find((c) => c.id === city.id);
  const selectedIndicator = createImage(scene, 'chara/selected_chara', 0, 20);
  selectedIndicator.setScale(0.4);
  city_.container.add(selectedIndicator);
  city_.container.sendToBack(selectedIndicator);
  city_.selectedIndicator = selectedIndicator;
}
