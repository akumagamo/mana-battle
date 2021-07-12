import { Unit } from '../../Unit/Model';
import TheaterScene from '../TheaterScene';
import { createUnit } from './createUnit';

export type FlipUnit = {
  type: 'FLIP';
  unit: Unit;
};

export const flipUnit = (scene: TheaterScene, { unit }: FlipUnit) => {
  const chara = scene.charas.get(scene.charaKey(unit.id));
  const { x, y } = chara.container;
  const { front } = chara.props;
  chara.destroy();

  createUnit(scene, {
    unit,
    x,
    y,
    front: !front,
    showWeapon: false,
    pose: '',
    type: 'CREATE_UNIT',
  });
};
