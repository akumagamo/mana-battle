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

  const class_ = randomItem(classes)
  return {
    id: n.toString(),
    name: randomItem(maleNames),
    class: class_,
    movement: 'plain',
    elem: 'neutral',
    gender: randomItem(['male', 'female']),
    equips: baseEquips[class_],
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

const baseEquips ={
'mage' : {
      ornament: 'amulet',
      chest: 'robe',
      mainHand: 'oaken_staff',
      offHand: 'none',
      head: 'wiz_hat',
    },
'fighter':{
      ornament: 'amulet',
      chest: 'iron_armor',
      mainHand: 'iron_sword',
      offHand: 'iron_shield',
      head: 'iron_helm',
    },
'archer':{
      ornament: 'amulet',
      chest: 'leather_armor',
      mainHand: 'bow',
      offHand: 'none',
      head:  'archer_hat',
    }
}
export function toJSON(_: Unit) {
  throw new Error('Not implemented.');
}
