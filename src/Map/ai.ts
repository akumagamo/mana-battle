/**
 * Stupid AI for enemy forces
 *
 */

import {Vector, TurnManager, MapUnit} from './Models';
import {getPossibleMoves} from './api';
import {Chara} from '../Chara/Chara';
import {randomItem} from '../defaultData';

/**
 * Picks a random valid cell in range and clicks it
 */
export const randomMove = (unit: MapUnit, chara: Chara) => {
  const {validSteps} = unit;

  return randomItem(validSteps);
};
