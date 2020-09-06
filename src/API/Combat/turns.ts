import S from 'sanctuary';
import {Unit} from '../../Unit/Model';
import {getUnitAttack, getUnitAttacks, getUnitDamage} from '../../Unit/Skills';
import {INVALID_STATE} from '../../errors';

const sortInitiative = (unit: TurnUnit) => unit.unit.dex + unit.unit.dex;

export const initiativeList = (units: TurnUnit[]) => {
  return units.sort((a, b) => sortInitiative(b) - sortInitiative(a));
};

export type Move = {type: 'MOVE'; source: string; target: string};
export type Return = {type: 'RETURN'; target: string};
export type Slash = {
  type: 'SLASH';
  source: string;
  target: string;
  damage: number;
  updatedTarget: Unit;
  updatedSource: Unit;
};
export type Shoot = {
  type: 'SHOOT';
  source: string;
  target: string;
  damage: number;
  updatedTarget: Unit;
  updatedSource: Unit;
};
export type Fireball = {
  type: 'FIREBALL';
  source: string;
  target: string;
  damage: number;
  updatedTarget: Unit;
  updatedSource: Unit;
};
export type Victory = {type: 'VICTORY'; target: string};
export type EndCombat = {type: 'END_COMBAT'};
export type EndTurn = {type: 'END_TURN'};
export type RestartTurns = {type: 'RESTART_TURNS'};

export type Command =
  | Move
  | Shoot
  | Fireball
  | Slash
  | Victory
  | EndTurn
  | RestartTurns
  | Return
  | EndCombat;

export const runCombat = (units: Unit[]): Command[] => {
  const turnUnits: TurnUnit[] = units.map((unit) => ({
    unit,
    remainingAttacks: getUnitAttack(unit).times,
  }));
  const unitList = initiativeList(turnUnits);

  return runTurn(0, unitList, []);
};

type TurnUnit = {unit: Unit; remainingAttacks: number};

/**
 * @param {number} turnNumber The current turn (starts at 0)
 * @param {Unit[]} units The units engaged in combat
 * */
export const runTurn = (
  turnNumber: number,
  units: TurnUnit[],
  commands: Command[],
): Command[] => {
  const current = units[turnNumber];
  const isLastActor = units.length - 1 === turnNumber;

  const nextTurn = isLastActor ? 0 : turnNumber + 1;

  if (current.unit.currentHp < 1) return runTurn(nextTurn, units, commands);

  if (!current.unit.squad) throw new Error(INVALID_STATE);

  // Decide on what to do based on the character's class
  // TODO: multiple conditions
  // TODO: remove mutation

  let turnCommands: Command[] = [];
  let updatedUnits = units;

  if (current.remainingAttacks > 0) {
    if (current.unit.class === 'archer') {
      const res = rangedAttackSingleTarget(current, units, commands);
      turnCommands = res.commands;
      updatedUnits = res.updatedUnits;
    } else if (current.unit.class === 'mage') {
      const res = rangedSpellSingleTarget(current, units, commands);
      turnCommands = res.commands;
      updatedUnits = res.updatedUnits;
    } else {
      const res = meleeAttackSingleTarget(current, units, commands);
      turnCommands = res.commands;
      updatedUnits = res.updatedUnits;
    }
  } else {
    turnCommands = commands;
  }

  const {squad} = current.unit;

  const victory: () => Victory = () => ({type: 'VICTORY', target: squad.id});

  const endCombat: () => EndCombat = () => ({type: 'END_COMBAT'});

  if (isVictory(current, updatedUnits)) {
    return turnCommands.concat([victory()]);
  } else if (noAttacksRemaining(updatedUnits)) {
    return turnCommands.concat([endCombat()]);
  } else {
    return runTurn(nextTurn, updatedUnits, turnCommands);
  }
};

function meleeAttackSingleTarget(
  current: TurnUnit,
  units: TurnUnit[],
  commands: Command[],
) {
  const target = getTarget(current.unit, units);

  if (!target) throw new Error(INVALID_STATE);

  const damage = getUnitDamage(current.unit);

  const updatedUnits = units
    .map((unit) => {
      const newHp = unit.unit.currentHp - damage;
      const currentHp = newHp < 1 ? 0 : newHp;

      return unit.unit.id === target.id
        ? {
            remainingAttacks: unit.remainingAttacks,
            unit: {...unit.unit, currentHp},
          }
        : unit;
    })
    .map((unit) => {
      return unit.unit.id === current.unit.id
        ? {remainingAttacks: unit.remainingAttacks - 1, unit: {...unit.unit}}
        : unit;
    });

  const updatedTarget = updatedUnits.find((u) => u.unit.id === target.id);

  const updatedSource = updatedUnits.find((u) => u.unit.id === current.unit.id);

  if (!updatedTarget || !updatedSource) throw new Error(INVALID_STATE);

  const move: Command[] = [
    {type: 'MOVE', source: current.unit.id, target: target.id},
  ];
  const slash: Command[] = [
    {
      type: 'SLASH',
      source: current.unit.id,
      target: target.id,
      damage,
      updatedTarget: updatedTarget.unit,
      updatedSource: updatedSource.unit,
    },
  ];

  const returnCmd: Command[] = [{type: 'RETURN', target: current.unit.id}];

  return {
    commands: commands
      .concat(move)
      .concat(slash)
      .concat(returnCmd),
    updatedUnits,
  };
}
function rangedAttackSingleTarget(
  current: TurnUnit,
  units: TurnUnit[],
  commands: Command[],
) {
  const target = getTarget(current.unit, units);

  if (!target) throw new Error(INVALID_STATE);

  const damage = getUnitDamage(current.unit);

  const updatedUnits = units
    .map((unit) => {
      const newHp = unit.unit.currentHp - damage;
      const currentHp = newHp < 1 ? 0 : newHp;

      return unit.unit.id === target.id
        ? {
            remainingAttacks: unit.remainingAttacks,
            unit: {...unit.unit, currentHp},
          }
        : unit;
    })
    .map((unit) => {
      return unit.unit.id === current.unit.id
        ? {remainingAttacks: unit.remainingAttacks - 1, unit: {...unit.unit}}
        : unit;
    });

  const updatedTarget = updatedUnits.find((u) => u.unit.id === target.id);

  const updatedSource = updatedUnits.find((u) => u.unit.id === current.unit.id);

  if (!updatedTarget || !updatedSource) throw new Error(INVALID_STATE);

  const useBow: Command[] = [
    {
      type: 'SHOOT',
      source: current.unit.id,
      target: target.id,
      damage,
      updatedTarget: updatedTarget.unit,
      updatedSource: updatedSource.unit,
    },
  ];

  return {
    commands: commands.concat(useBow),
    updatedUnits,
  };
}
function rangedSpellSingleTarget(
  current: TurnUnit,
  units: TurnUnit[],
  commands: Command[],
) {
  const target = getTarget(current.unit, units);

  if (!target) throw new Error(INVALID_STATE);

  const damage = getUnitDamage(current.unit);

  const updatedUnits = units
    .map((unit) => {
      const newHp = unit.unit.currentHp - damage;
      const currentHp = newHp < 1 ? 0 : newHp;

      return unit.unit.id === target.id
        ? {
            remainingAttacks: unit.remainingAttacks,
            unit: {...unit.unit, currentHp},
          }
        : unit;
    })
    .map((unit) => {
      return unit.unit.id === current.unit.id
        ? {remainingAttacks: unit.remainingAttacks - 1, unit: {...unit.unit}}
        : unit;
    });

  const updatedTarget = updatedUnits.find((u) => u.unit.id === target.id);

  const updatedSource = updatedUnits.find((u) => u.unit.id === current.unit.id);

  if (!updatedTarget || !updatedSource) throw new Error(INVALID_STATE);

  const useFireball: Command[] = [
    {
      type: 'FIREBALL',
      source: current.unit.id,
      target: target.id,
      damage,
      updatedTarget: updatedTarget.unit,
      updatedSource: updatedSource.unit,
    },
  ];

  return {
    commands: commands.concat(useFireball),
    updatedUnits,
  };
}

function isVictory(current: TurnUnit, units: TurnUnit[]) {
  const teamDefeated = S.pipe([
    S.map(S.prop('unit')),
    S.filter(isFromAnotherSquad(current.unit)),
    S.all((e: Unit) => !isAlive(e)),
  ])(units);

  return teamDefeated;
}

function noAttacksRemaining(units: TurnUnit[]) {
  return S.all((u: TurnUnit) => u.remainingAttacks < 1)(units);
}

// TODO: add get closest target option
export function getTarget(current: Unit, units: TurnUnit[]) {
  return units
    .map((u) => u.unit)
    .filter(isFromAnotherSquad(current))
    .filter(isAlive)
    .sort((a, b) => a.currentHp - b.currentHp)[0];
}

function isAlive(unit: Unit) {
  return unit.currentHp > 0;
}

function isFromAnotherSquad(current: Unit) {
  return function(unit: Unit) {
    return current.squad?.id !== unit.squad?.id;
  };
}
