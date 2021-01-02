import {PLAYER_FORCE} from '../../constants';
import {Container} from '../../Models';
import button from '../../UI/button';
import text from '../../UI/text';
import dispatchWindow from '../dispatchWindow';
import {MapScene} from '../MapScene';

export default async (
  scene: MapScene,
  uiContainer: Container,
  baseY: number,
  id: string,
): Promise<void> => {
  const city = await scene.getCity(id);

  text(20, baseY, city.name, uiContainer, scene);

  if (city.type === 'castle' && city.force === PLAYER_FORCE)
    button(200, baseY, 'Dispatch', uiContainer, scene, () => {
      scene.disableMapInput();
      dispatchWindow(scene);
    });

  button(400, baseY, 'Organize', uiContainer, scene, () => {

    console.log('organize btn')



    });

  if (city.force){
    const force = await scene.getForce(city.force)
    text(
      1000,
      baseY,
      `Controlled by ${force.name}`,
      uiContainer,
      scene,
    );

  }
};
