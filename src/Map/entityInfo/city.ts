import {Container} from '../../Models';
import text from '../../UI/text';
import {MapScene} from '../MapScene';

export default (scene: MapScene, uiContainer: Container, baseY:number, id:string): void => {
  const city = scene.cityIO(id);

  text(20, baseY, city.name, uiContainer, scene);
  if (city.force)
    text(
      1000,
      baseY,
      `Controlled by ${scene.getForce(city.force).name}`,
      uiContainer,
      scene,
    );
};
