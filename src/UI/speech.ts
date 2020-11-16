import {Scene} from 'phaser';
import {Chara} from '../Chara/Chara';
import {Container} from '../Models';
import {Unit} from '../Unit/Model';
import panel from './panel';
import text from './text';

export default (
  unit: Unit,
  x: number,
  y: number,
  text_:string,
  container: Container,
  scene: Scene,
) => {
  const bg = panel(x, y, 440, 200, container, scene);

  const portrait = new Chara(
    `speech_${unit.id}`,
    scene,
    unit,
    x + 70,
    y + 70,
    1,
    true,
    false,
    true,
  );

  const speechText = text(x + 130, y + 50, text_, container, scene);

  return {bg, portrait, speechText}
};
