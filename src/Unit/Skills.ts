import {Elem, Unit, UnitClass} from './Model';
import * as DB from '../DB';

export type Attack = {
  name: string;
  damage: number;
  elem: Elem;
  times: number;
};

type Row = 'front' | 'middle' | 'back';

const slash = (times: number) => (unit: Unit): Attack => {
  return {
    name: 'Slash',
    damage: unit.str * 2,
    elem: 'neutral',
    times: times,
  };
};

const fireball = (times: number) => (unit: Unit): Attack => {
  return {
    name: 'Fireball',
    damage: unit.int * 2,
    elem: 'fire',
    times: times,
  };
};
const iceBolt = (times: number) => (unit: Unit): Attack => {
  return {
    name: 'Ice Bold',
    damage: unit.int * 2,
    elem: 'water',
    times: times,
  };
};

const shoot = (times: number) => (unit: Unit): Attack => {
  return {
    name: 'Shoot',
    damage: unit.dex * 2,
    elem: 'neutral',
    times: times,
  };
};

const spell = (times: number) => (unit: Unit) => {
  if (unit.elem === 'fire') return fireball(times);
  else if (unit.elem === 'water') return iceBolt(times);
  else return fireball;
};

export type UnitAttacks = { [x in Row]: (u:Unit)=>Attack };

export const skills: {[x in UnitClass]: UnitAttacks} = {
  fighter: {
    front: slash(2),
    middle: slash(1),
    back: slash(1),
  },
  mage: {
    front: fireball(1),
    middle: fireball(1),
    back: fireball(2),
  },
  archer: {
    front: shoot(1),
    middle: shoot(1),
    back: shoot(2),
  },
};

export function getUnitAttacks(class_:UnitClass) {
  return skills[class_];
}

export function getUnitDamage(unit: Unit) {
  return getUnitAttack(unit).damage;
}

export function getUnitAttack(unit: Unit) {
  const getPos = (): Row => {
    if (unit.squad?.y === 0) return 'back';
    else if (unit.squad?.y === 1) return 'middle';
    else return 'front';
  };

  return unit.attacks[getPos()](unit);
}
