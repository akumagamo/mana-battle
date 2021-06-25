import { HAIR_COLORS, SKIN_COLORS } from '../Chara/animations/constants';
import { maleNames } from '../constants/names';
import { randomItem } from '../utils';
import {
  Elem,
  Gender,
  HAIR_STYLES,
  Movement,
  Unit,
  UnitClass as UnitJob,
} from './Model';
import { getUnitAttacks } from './Skills';
import { baseEquips } from './Jobs';
import { PLAYER_FORCE } from '../constants';

export default function createUnit(
  id = '1',
  job = 'fighter' as UnitJob,
  lvl = 1,
  overrides = {}
): Unit {
  const baseStats: {
    [job in UnitJob]: { hp: number; str: number; dex: number; int: number };
  } = {
    fighter: {
      hp: 80,
      str: 18,
      dex: 15,
      int: 11,
    },
    mage: {
      hp: 60,
      str: 10,
      dex: 12,
      int: 20,
    },
    archer: {
      hp: 70,
      str: 13,
      dex: 18,
      int: 12,
    },
  };

  return {
    name: randomItem(maleNames),
    id,
    class: job,
    equips: baseEquips[job],
    lvl,
    attacks: getUnitAttacks(job),
    movement: 'plain' as Movement,
    elem: 'neutral' as Elem,
    gender: randomItem(['male', 'female'] as Gender[]),
    exp: 0,
    squad: null,
    force: PLAYER_FORCE,
    style: {
      skinColor: randomItem(SKIN_COLORS),
      hairColor: randomItem(HAIR_COLORS),
      hair: randomItem(HAIR_STYLES),
      displayHat: randomItem([true, false]),
    },
    ...baseStats[job],
    currentHp: baseStats[job].hp,
    ...overrides,
  };
}
