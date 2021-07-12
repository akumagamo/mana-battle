import { Chara } from '../Chara/Model';
import { Container } from '../Models';
import createUnit from '../Unit/createUnit';
import { Unit } from '../Unit/Model';

export type CharaCreationState = {
  unit: Unit;
  container: Container;
  chara: Chara;
};

const unit = createUnit('new_chara');

export const initialUnit = {
  ...unit,
  style: {
    ...unit.style,
    displayHat: false,
  },
};
