import {Unit} from '../../Unit/Model';
import {INVALID_STATE} from '../../errors';
import {TeamMember, Combat} from './Model';

const sortInitiative = (unit: Unit) => unit.agi + unit.dex;

export const initiativeList = (units: Unit[]) => {
  return units.sort((a, b) => sortInitiative(b) - sortInitiative(a));
};

interface CombatResult {
  victory: string;
  units: Unit[];
}

/**
 * @param {number} turnNumber The current turn (starts at 0)
 * @param {Unit[]} units The units engaged in combat. Already sorted by initiative
 * */
export const runTurn = (turnNumber: number, units: Unit[]): CombatResult => {
  const isLastActor = units.length - 1 === turnNumber;

  const current = units[turnNumber];

  if (!current.squad) throw new Error(INVALID_STATE);

  const target = getTarget(current, units);

  if (!target) throw new Error(INVALID_STATE);
  damageUnit(target, 10);

  if (endCombatCondition(current, units))
    return {victory: current.squad, units};

  if (isLastActor) return runTurn(0, units);
  else return runTurn(turnNumber + 1, units);
};

function endCombatCondition(current: Unit, units: Unit[]) {
  return units.filter(isFromAnotherSquad(current)).every((e) => !isAlive(e));
}

export function getTarget(current: Unit, units: Unit[]) {
  return units
    .filter(isFromAnotherSquad(current))
    .filter(isAlive)
    .sort((a, b) => a.currentHp - b.currentHp)[0];
}

function isAlive(unit: Unit) {
  return unit.currentHp > 0;
}

function isFromAnotherSquad(current: Unit) {
  return function(unit: Unit) {
    return current.squad !== unit.squad;
  };
}

function damageUnit(unit: Unit, dmg: number) {
  unit.currentHp = unit.currentHp - dmg;
  if (unit.currentHp < 0) unit.currentHp = 0;
}
