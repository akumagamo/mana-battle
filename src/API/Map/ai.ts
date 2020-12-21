/**
 * Stupid AI for enemy forces
 *
 */

import {randomItem} from '../../utils';
import {MapSquad} from './Model';

/**
 * Picks a random valid cell in range and clicks it
 */
export const randomMove = (unit: MapSquad) => {
  const {validSteps} = unit;

  return randomItem(validSteps.toJS());
};
