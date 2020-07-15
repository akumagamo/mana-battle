/**
 * Stupid AI for enemy forces
 *
 */

import {randomItem} from '../../defaultData';
import {MapUnit} from './Model';

/**
 * Picks a random valid cell in range and clicks it
 */
export const randomMove = (unit: MapUnit) => {
  const {validSteps} = unit;

  return randomItem(validSteps);
};
