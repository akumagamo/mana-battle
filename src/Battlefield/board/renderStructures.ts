import { Image } from "../../Models";
import { MapScene } from "../MapScene";
import { MapState } from "../Model";
import { cellToScreenPosition } from "./position";

const CITY_SCALE = 0.5;

export default (scene: MapScene, state: MapState) => {
  state.cities.forEach((city) => {
    const { x, y } = cellToScreenPosition({ x: city.x, y: city.y });

    const image = scene.add.image(0, 0, `tiles/${city.type}`);
    image.setScale(CITY_SCALE);
    const city_ = {
      id: city.id,
      image,
      container: scene.add.container(x, y, image),
      selectedIndicator: null as null | Image,
    };

    state.mapContainer.add(city_.container);
    state.citySprites.push(city_);
  });
};
