import {Unit} from '../../Unit/Model';
import {getUnitAttack} from '../../Unit/Skills';

export function makeTurnUnit(unit: Unit) {
  return {remainingAttacks: getUnitAttack(unit).times, unit};
}
