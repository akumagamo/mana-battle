import {Unit, HAIR_STYLES, genders} from './Model';
import {maleNames} from '../constants/names';
import { classes} from '../defaultData';
import {randomItem } from '../utils';
import {SKIN_COLORS, HAIR_COLORS} from '../Chara/animations/constants';
import {getUnitAttacks} from './Skills';
import {baseEquips} from './Jobs';
import {PLAYER_FORCE} from '../constants';




/**
 * @todo replace with reading data from the database (JSON) and generating a valid unit
 * @param {number} n
 */
export function fromJSON(n: number): Unit {
  const job = randomItem(classes);
  return {
    id: n.toString(),
    name: randomItem(maleNames),
    class: job,
    movement: 'plain',
    elem: 'neutral',
    gender: randomItem(genders),
    equips: baseEquips[job],
    squad: null,
    force: PLAYER_FORCE,
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
    attacks: getUnitAttacks(job),
  };
}


export function toJSON(_: Unit) {
  throw new Error('Not implemented.');
}
