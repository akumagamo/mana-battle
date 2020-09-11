import {HAIR_COLORS, SKIN_COLORS} from '../Chara/animations/constants';
import {maleNames} from '../constants/names';
import {randomItem} from '../defaultData';
import {HAIR_STYLES, Unit} from './Model';
import {getUnitAttacks} from './Skills';

export function fighter(id: number, squad: number, lvl: number): Unit {
  return {
    id: id.toString(),
    name: randomItem(maleNames),
    class: 'fighter',
    movement: 'plain',
    elem: 'neutral',
    gender: randomItem(['male', 'female']),
    equips: {
      ornament: 'amulet',
      chest: 'iron_armor',
      mainHand: 'iron_sword',
      offHand: 'iron_shield',
      head: 'iron_helm',
    },
    squad: {id: squad.toString(), x: 2, y: 2},
    lvl,
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
    attacks: getUnitAttacks('fighter'),
  };
}
