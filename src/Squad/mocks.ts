import {maleNames} from '../constants/names';
import {randomItem} from '../defaultData';
import {makeUnit} from '../Unit/Jobs';
import {Squad} from './Model';

/**
 * a _ f
 * _ _ f
 * a _ F
 */
export function fighterArcherSquad(
  force: string,
  unitIdPrefix: string,
  squadIdPrefix: string,
) {
  const leaderName = randomItem(maleNames);

  const units = {
    [unitIdPrefix + 1]: {
      ...makeUnit('fighter', unitIdPrefix + 1, 1),
      squad: {id: squadIdPrefix + 1, leader: false, x: 3, y: 1},
    },
    [unitIdPrefix + 2]: {
      ...makeUnit('fighter', unitIdPrefix + 2, 1),
      squad: {id: squadIdPrefix + 1, leader: true, x: 3, y: 2},
    },
    [unitIdPrefix + 3]: {
      ...makeUnit('fighter', unitIdPrefix + 3, 1),
      squad: {id: squadIdPrefix + 1, leader: false, x: 3, y: 3},
    },
    [unitIdPrefix + 4]: {
      ...makeUnit('archer', unitIdPrefix + 4, 1),
      squad: {id: squadIdPrefix + 1, leader: false, x: 1, y: 1},
    },
    [unitIdPrefix + 5]: {
      ...makeUnit('archer', unitIdPrefix + 5, 1),
      squad: {id: squadIdPrefix + 1, leader: false, x: 1, y: 3},
    },
  };

  const squad: {[id: string]: Squad} = {
    [squadIdPrefix + 1]: {
      id: squadIdPrefix + 1,
      name: leaderName,
      members: {
        [unitIdPrefix + 1]: {
          id: unitIdPrefix + 1,
          x: 3,
          y: 1,
          leader: false,
        },
        [unitIdPrefix + 2]: {
          id: unitIdPrefix + 2,
          x: 3,
          y: 2,
          leader: true,
        },
        [unitIdPrefix + 3]: {
          id: unitIdPrefix + 3,
          x: 3,
          y: 3,
          leader: false,
        },
        [unitIdPrefix + 4]: {
          id: unitIdPrefix + 4,
          x: 1,
          y: 3,
          leader: false,
        },
        [unitIdPrefix + 5]: {
          id: unitIdPrefix + 5,
          x: 1,
          y: 3,
          leader: false,
        },
      },
      force: force,
    },
  };

  return {units, squad};
}
