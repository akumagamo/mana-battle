import * as Squad from "../Squad/Model";
import { Unit } from "../Unit/Model";
import { getUnitAttack } from "../Unit/Skills";

export function makeTurnUnit(squadIndex: Squad.Index, unit: Unit) {
  return { remainingAttacks: getUnitAttack(squadIndex, unit).times, unit };
}
