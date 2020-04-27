import {Unit} from '../../Unit/Model';
import {INVALID_STATE} from '../../errors';

const sortInitiative = (unit: Unit) => unit.agi + unit.dex;

export const initiativeList = (units: Unit[]) => {
  return units.sort((a, b) => sortInitiative(b) - sortInitiative(a));
};


export type Move = {type: 'MOVE'; source: string; target: string};
export type Return = {type: 'RETURN'; target: string; };
export type Attack = {type: 'ATTACK'; source: string; target: string};
export type Victory = {type: 'VICTORY'; target: string};
export type EndTurn = {type: 'END_TURN'};
export type RestartTurns = {type: 'RESTART_TURNS'};

export type Command = Move | Attack | Victory | EndTurn | RestartTurns | Return;

/**
 * @param {number} turnNumber The current turn (starts at 0)
 * @param {Unit[]} units The units engaged in combat. Already sorted by initiative
 * */
export const runTurn = (turnNumber: number, units: Unit[]): Command[] => {

  const isLastActor = units.length - 1 === turnNumber;

  const current = units[turnNumber];

  const commands: Command[] = [];

  if (!current.squad) throw new Error(INVALID_STATE);

  const target = getTarget(current, units);

  if (!target) throw new Error(INVALID_STATE);

  commands.push({type: 'MOVE', source: current.id, target: target.id});
  commands.push({type: 'ATTACK', source: current.id, target: target.id});

  commands.push({type: 'RETURN', target: current.id});

  if (endCombatCondition(current, units))
    commands.push({type: 'VICTORY', target: current.squad});

  if (isLastActor) commands.push({type: 'RESTART_TURNS'});
  else commands.push({type: 'END_TURN'});

  return commands;
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
