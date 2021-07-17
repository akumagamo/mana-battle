import createChara from '../../Chara/createChara';
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
    scene,
    unit,
    x: x,
    y: y,
    scale: 1,
    front,
    showWeapon,
  });

  scene.container?.add(chara.container);

  scene.charas = scene.charas.set(key, chara);
};
