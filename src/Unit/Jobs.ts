import {HAIR_COLORS, SKIN_COLORS} from '../Chara/animations/constants';
import {maleNames} from '../constants/names';
import {randomItem} from '../defaultData';
import {Elem, Gender, HAIR_STYLES, Movement, Unit, UnitClass} from './Model';
import {baseEquips} from './serializer';
import {getUnitAttacks} from './Skills';

export function makeUnit(class_: UnitClass, id: number, lvl: number): Unit {
  return {
    name: randomItem(maleNames),
    id: id.toString(),
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
