import { MapScene } from '../MapScene';
import { MapState } from '../Model';
import { cellToScreenPosition } from './position';

const CITY_SCALE = 0.5;

export default (scene: MapScene, state: MapState) => {
  state.cities.forEach((city) => {
    const { x, y } = cellToScreenPosition({ x: city.x, y: city.y });

    const city_ = scene.add.image(x, y, `tiles/${city.type}`);

    city_.setScale(CITY_SCALE);

    if (city.force === 'PLAYER_FORCE') {
      //city_.setTint(ALLIED_CITY_TINT);
    } else {
      //city_.setTint(ENEMY_CITY_TINT);
    }
    // city_.setInteractive();
    // city_.on('pointerup', () => {
    //     this.signal([{type: 'CITY_CLICK', id: city.id}]);
    // });
    state.mapContainer.add(city_);
    city_.name = city.id;
    state.citySprites.push(city_);
  });
};
