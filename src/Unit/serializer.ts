import {Unit, HAIR_STYLES} from './Model';
import {maleNames} from '../constants/names';
import { classes} from '../defaultData';
import {randomItem } from '../utils';
import {SKIN_COLORS, HAIR_COLORS} from '../Chara/animations/constants';
import {getUnitAttacks} from './Skills';
import {baseEquips} from './Jobs';




/**
 * @todo replace with reading data from the database (JSON) and generating a valid unit
 * @param {number} n
 */
export function fromJSON(n: number): Unit {
  const class_ = randomItem(classes);
  return {
    id: n.toString(),
    name: randomItem(maleNames),
    class: class_,
    movement: 'plain',
    elem: 'neutral',
    gender: randomItem(['male', 'female']),
    equips: baseEquips[class_],
    squad: null,
    lvl: 1,
    hp: 50,
    currentHp: 50,
    exp: 0,
    str: 10,
    dex: 10,
    int: 10,
    style: {
      skinColor: randomItem(SKIN_COLORS),
      hairColor: randomItem(HAIR_COLORS),
      hair: randomItem(HAIR_STYLES),
      displayHat: randomItem([true, false]),
    },
    attacks: getUnitAttacks(class_),
  };
}


export function toJSON(_: Unit) {
  throw new Error('Not implemented.');
}
