import {Unit} from '../../Unit/Model';
import {INVALID_STATE} from '../../errors';

const sortInitiative = (unit: Unit) => unit.agi + unit.dex;

export const initiativeList = (units: Unit[]) => {
  return units.sort((a, b) => sortInitiative(b) - sortInitiative(a));
};

export type Move = {type: 'MOVE'; source: string; target: string};
export type Return = {type: 'RETURN'; target: string};
export type Attack = {
  type: 'ATTACK';
  source: string;
  target: string;
  damage: number;
  updatedTarget: Unit;
};
export type Victory = {type: 'VICTORY'; target: string};
export type EndTurn = {type: 'END_TURN'};
export type RestartTurns = {type: 'RESTART_TURNS'};

export type Command = Move | Attack | Victory | EndTurn | RestartTurns | Return;

export const runCombat = (units: Unit[]): Command[] => {
  const unitList = initiativeList(units);

  return runTurn(0, unitList, []);
};

/**
 * @param {number} turnNumber The current turn (starts at 0)
 * @param {Unit[]} units The units engaged in combat
 * */
export const runTurn = (
  turnNumber: number,
  units: Unit[],
  commands: Command[],
): Command[] => {

  const current = units[turnNumber];
  const isLastActor = units.length - 1 === turnNumber;

    const nextTurn = isLastActor ? 0 : turnNumber + 1;

  if (current.currentHp < 1) return runTurn(nextTurn,units,commands);

  if (!current.squad) throw new Error(INVALID_STATE);

  const target = getTarget(current, units);

  if (!target) throw new Error(INVALID_STATE);

  const updatedUnits = units.map((unit) => {
    const newHp = unit.currentHp - 22;
    const currentHp = newHp < 1 ? 0 : newHp;

    return unit.id === target.id ? {...unit, currentHp} : unit;
  });

  const updatedTarget = updatedUnits.find(u=>u.id === target.id)

  if(!updatedTarget) throw new Error(INVALID_STATE)

  const move: Command[] = [
    {type: 'MOVE', source: current.id, target: target.id},
  ];
  const attack: Command[] = [
    {
      type: 'ATTACK',
      source: current.id,
      target: target.id,
      damage: 22,
      updatedTarget,
    },
  ];

  const returnCmd: Command[] = [{type: 'RETURN', target: current.id}];

  const turnCommands: Command[] = commands
    .concat(move)
    .concat(attack)
    .concat(returnCmd);

  const victory: Victory = {type: 'VICTORY', target: current.squad};

  if (endCombatCondition(current, updatedUnits)) {
    return turnCommands.concat([victory]);
  } else {
    return runTurn(nextTurn, updatedUnits, turnCommands);
  }
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
