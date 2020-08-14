import {Unit, HAIR_STYLES} from './Model';
import {maleNames} from '../constants/names';
import {randomItem, classes} from '../defaultData';
import {random} from '../utils';
import {SKIN_COLORS, HAIR_COLORS} from '../Chara/animations/constants';
/**
 * @todo replace with reading data from the database (JSON) and generating a valid unit
 * @param n
 */
export function fromJSON(n: number): Unit {
  return {
    id: n.toString(),
    name: randomItem(maleNames),
    class: randomItem(classes),
    movement: 'plain',
    elem: 'neutral',
    gender: randomItem(['male', 'female']),
    equips: {
      ornament: 'amulet',
      chest: 'iron_armor',
      mainHand: randomItem(['iron_sword', 'iron_spear', 'oaken_staff']),
      offHand: 'iron_shield',
      head: randomItem(['none', 'iron_helm', 'simple_helm', 'wiz_hat', 'archer_hat']),
    },
    squad: null,
    lvl: 11,
    hp: 100,
    currentHp: 100,
    exp: 99,
    str: random(10, 200),
    agi: random(10, 200),
    dex: random(10, 200),
    vit: random(10, 200),
    int: random(10, 200),
    wis: random(10, 200),
    style: {
      skinColor: randomItem(SKIN_COLORS),
      hairColor: randomItem(HAIR_COLORS),
      hair: randomItem(HAIR_STYLES),
    },
  };
}

export function toJSON(_: Unit) {
  throw new Error('Not implemented.');
}
