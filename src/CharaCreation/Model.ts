import { Chara } from '../Chara/Model';
import { Container } from '../Models';
import { makeUnit } from '../Unit/makeUnit';
import { Unit } from '../Unit/Model';

export type CharaCreationState = {
  unit: Unit;
  container: Container;
  chara: Chara;
};

const unit = makeUnit('new_chara');

export const initialUnit = {
  ...unit,
  style: {
    ...unit.style,
    displayHat: false,
  },
};
