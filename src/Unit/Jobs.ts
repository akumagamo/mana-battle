import {HAIR_COLORS, SKIN_COLORS} from '../Chara/animations/constants';
import {maleNames} from '../constants/names';
import {randomItem} from '../utils';
import {Elem, Gender, HAIR_STYLES, Movement, Unit, UnitClass} from './Model';
import {getUnitAttacks} from './Skills';

export const baseEquips = {
  mage: {
    ornament: 'amulet',
    chest: 'robe',
    mainHand: 'oaken_staff',
    offHand: 'none',
    head: 'wiz_hat',
  },
  fighter: {
    ornament: 'amulet',
    chest: 'iron_armor',
    mainHand: 'iron_sword',
    offHand: 'iron_shield',
    head: 'iron_helm',
  },
  archer: {
    ornament: 'amulet',
    chest: 'leather_armor',
    mainHand: 'bow',
    offHand: 'none',
    head: 'archer_hat',
  },
};

export function makeUnit(
  class_: UnitClass,
  id: number | string,
  lvl: number,
): Unit {

  return {
    name: randomItem(maleNames),
    id: typeof id === 'string' ? id : id.toString(),
    class: class_,
    equips: baseEquips[class_],
    lvl,
    attacks: getUnitAttacks(class_),
    movement: 'plain' as Movement,
    elem: 'neutral' as Elem,
    gender: randomItem(['male', 'female'] as Gender[]),
    hp: 50,
    currentHp: 50,
    exp: 0,
    str: 10,
    dex: 10,
    int: 10,
    squad: null,
    style: {
      skinColor: randomItem(SKIN_COLORS),
      hairColor: randomItem(HAIR_COLORS),
      hair: randomItem(HAIR_STYLES),
      displayHat: randomItem([true, false]),
    },
  };
}
