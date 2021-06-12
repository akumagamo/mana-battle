import createChara from '../../Chara/createChara';
import { Chara } from '../../Chara/Model';
import { Unit } from '../../Unit/Model';
import TheaterScene from '../TheaterScene';

export type CreateUnit = {
  type: 'CREATE_UNIT';
  unit: Unit;
  x: number;
  y: number;
  front: boolean;
  pose: string;
  showWeapon: boolean;
};
export const createUnit = (
  scene: TheaterScene,
  { unit, x, y, front, showWeapon }: CreateUnit
) => {
  const key = scene.charaKey(unit.id);
  const chara = createChara({
    parent: scene,
    unit,
    x: x,
    y: y,
    scale: 1,
    front,
    showWeapon,
  });

  scene.container.add(chara.charaWrapper);

  scene.charas = scene.charas.set(key, chara);
};
