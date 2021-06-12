import { Scene } from 'phaser';
import createChara from '../Chara/createChara';
import { Container } from '../Models';
import { Unit } from '../Unit/Model';
import panel from './panel';
import text from './text';

/**
 * Be careful calling this after MapScene's CLICK_SQUAD, as refreshing
 * the UI container (and having it as parent for this) will throw
 * errors at the Chara and text container levels
 */
export default async (
  unit: Unit,
  x: number,
  y: number,
  text_: string,
  container: Container,
  scene: Scene,
  speed: number
) => {
  const portrait = createChara({
    parent: scene,
    unit,
    x: x + 70,
    y: y + 70,
    headOnly: true,
    animated: false,
  });

  const finalText = text(0, 0, text_, container, scene);
  const bg = panel(
    x,
    y,
    finalText.width + portrait.head.displayWidth + 40,
    finalText.height + portrait.head.displayHeight / 3 + 40, // the full body size is included here. TODO: separate rendering of head
    container,
    scene
  );
  finalText.destroy();

  text(x + 150, y + 10, unit.name, container, scene);

  const speechText = text(x + 150, y + 50, text_, container, scene);

  //const textCompleted = await animatedText(scene, text_, speechText, speed);

  const textCompleted = Promise.resolve();

  //TODO: return function that destroys the component and removes the portrait scene
  return { bg, portrait, speechText, textCompleted };
};
