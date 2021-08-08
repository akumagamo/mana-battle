import {Scene} from 'phaser';
import createChara from '../Chara/createChara';
import {Container} from '../Models';
import {Unit} from '../Unit/Model';
import panel from './panel';
import text from './text';

/**
 * Be careful calling this after Phaser.Scene's CLICK_SQUAD, as refreshing
 * the UI container (and having it as parent for this) will throw
 * errors at the Chara and text container levels
 */
export default (
  unit: Unit,
  x: number,
  y: number,
  text_: string,
  container: Container,
  scene: Scene,
) => {
  const container_ = scene.add.container(x, y);
  container.add(container_);

  panel(0, 0, 550, 140, container_, scene);

  const portrait = createChara({
    scene: scene,
    unit,
    x: 70,
    y: 70,
  });

  text(150, 30, unit.name, container_, scene);

  text(150, 70, text_, container_, scene);

  container_.add([portrait.container]);

  return container_;
};
