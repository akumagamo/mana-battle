import S from 'sanctuary';
import {Unit, UnitSquadPosition} from '../../Unit/Model';
import {getUnitAttack, getUnitDamage} from '../../Unit/Skills';
import {INVALID_STATE} from '../../errors';
import {invertBoardPosition} from './utils';
import {getMeleeTarget} from './getMeleeTarget';
import {random} from '../../utils';
import {Set} from 'immutable';

const sortInitiative = (unit: TurnUnit) => random(1, 6) + unit.unit.dex;

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
export type EndCombat = {type: 'END_COMBAT'; units: Unit[]};
export type EndTurn = {type: 'END_TURN'};
export type RestartTurns = {type: 'RESTART_TURNS'};
export type DisplayXP = {
  type: 'DISPLAY_XP';
  xp: number;
  lvls: number;
  id: string;
};

const displayXPCmd = ({
  xp,
  lvls,
  id,
}: {
  xp: number;
  lvls: number;
  id: string;
}): DisplayXP => ({type: 'DISPLAY_XP', xp, lvls, id});

export type Command =
  | Move
  | Shoot
  | Fireball
  | Slash
  | Victory
  | EndTurn
  | DisplayXP
  | RestartTurns
  | Return
  | EndCombat;

export const runCombat = (units: Unit[]): Command[] => {
  const squads = units.reduce(
    (xs, x) => xs.add(x.squad.id),
    Set() as Set<string>,
  );
  const turnUnits: TurnUnit[] = units.map((unit) => ({
    unit,
    remainingAttacks: getUnitAttack(unit).times,
  }));
  const unitList = initiativeList(turnUnits);

  return runTurn(0, squads, unitList, []);
};

/** Unit that is guaranteed in a squad */
export type UnitInSquad = Unit & {squad: UnitSquadPosition};

export type TurnUnit = {unit: UnitInSquad; remainingAttacks: number};

export const runTurn = (
  turnNumber: number,
  squads: Set<string>,
  units: TurnUnit[],
  commands: Command[],
): Command[] => {
  const current = units[turnNumber];
  const {unit, remainingAttacks} = current;
  const isLastActor = units.length - 1 === turnNumber;

  const nextTurn = isLastActor ? 0 : turnNumber + 1;

  // Decide on what to do based on the character's class
  // TODO: multiple conditions
  // TODO: remove mutation

  let turnCommands: Command[] = [];
  let updatedUnits = units;

  const hasRemainingAttacks = remainingAttacks > 0;
  const isAlive = unit.currentHp > 0;

  if (hasRemainingAttacks && isAlive) {
    let res;
    switch (current.unit.class) {
      case 'archer':
        res = rangedAttackSingleTarget(current, units, commands);
        turnCommands = res.commands;
        updatedUnits = res.updatedUnits;
        break;
      case 'mage':
        res = rangedSpellSingleTarget(current, units, commands);
        turnCommands = res.commands;
        updatedUnits = res.updatedUnits;
        break;
      case 'fighter':
        res = meleeAttackSingleTarget(current, units, commands);
        turnCommands = res.commands;
        updatedUnits = res.updatedUnits;
        break;
      default:
        break;
    }
  } else {
    turnCommands = commands;
  }

  const {squad} = unit;

  const victory: () => Victory = () => ({type: 'VICTORY', target: squad.id});

  const endCombat: (cmds: Command[]) => Command[] = (cmds: Command[]) => {
    const squadXp = squads.map((squadId) => {
      const enemyUnits = units.filter((u) => u.unit.squad.id !== squadId);

      //TODO: adjust xp based on enemy level
      const deadEnemies = enemyUnits
        .map((u) => (u.unit.currentHp < 1 ? 1 : 0))
        .reduce((xs, x) => xs + x, 0);

      const xpAmount = deadEnemies * 40;

      return {squadId, xpAmount};
    });

    const MAX_XP = 100;

    const xpInfo: {
      unit: UnitInSquad;
      xp: number;
      lvls: number;
    }[] = updatedUnits.map((u) => {
      const {unit} = u;

      const {xpAmount} = squadXp.find((s) => s.squadId === unit.squad.id);

      if (xpAmount < 1) return {xp: 0, lvls: 0, unit};

      const newXp = unit.exp + xpAmount;

      const lvls = Math.floor(newXp / MAX_XP);

      return {
        unit: {
          ...unit,
          lvl: unit.lvl + lvls,
          xp: newXp,
        },

        xp: xpAmount,
        lvls,
      };
    });

    const xps = xpInfo
      .filter(({xp, lvls}) => xp > 0 || lvls > 0)
      .map(({xp, lvls, unit}) => displayXPCmd({xp, lvls, id: unit.id}));

    return cmds
      .concat(xps)
      .concat([{type: 'END_COMBAT', units: xpInfo.map((u) => u.unit)}]);
  };

  if (isVictory(current, updatedUnits)) {
    return turnCommands.concat([victory()]);
  } else if (noAttacksRemaining(updatedUnits)) {
    return endCombat(turnCommands);
  } else {
    return runTurn(nextTurn, squads, updatedUnits, turnCommands);
  }
};

function meleeAttackSingleTarget(
  current: TurnUnit,
  units: TurnUnit[],
  commands: Command[],
) {
  const target = getMeleeTarget(current.unit, units);

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
        ? {
            remainingAttacks: unit.remainingAttacks - 1,
            unit: {...unit.unit},
          }
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
    commands: commands.concat(move).concat(slash).concat(returnCmd),
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
        ? {
            remainingAttacks: unit.remainingAttacks - 1,
            unit: {...unit.unit},
          }
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
        ? {
            remainingAttacks: unit.remainingAttacks - 1,
            unit: {...unit.unit},
          }
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
  return units
    .filter((u) => isAlive(u.unit))
    .every((u) => u.remainingAttacks < 1);
}

export function transpose({id, x, y}: UnitSquadPosition) {
  return {
    id,
    x: invertBoardPosition(x) + 3,
    y: invertBoardPosition(y),
  };
}

// TODO: add get closest target option
export function getTarget(current: Unit, units: TurnUnit[]) {
  return units
    .map((u) => u.unit)
    .filter(isFromAnotherSquad(current))
    .filter(isAlive)
    .map((u) => {
      if (u.squad === null) throw new Error('Null squad');
      return {...u, squad: transpose(u.squad)};
    })
    .sort(
      (a, b) =>
        Math.abs(a.squad.x - b.squad.x) + Math.abs(a.squad.y - b.squad.y),
    )[0];
}

export function isAlive(unit: Unit) {
  return unit.currentHp > 0;
}

export function isFromAnotherSquad(current: Unit) {
  return function (unit: Unit) {
    return current.squad?.id !== unit.squad?.id;
  };
}
