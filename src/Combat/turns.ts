import * as Unit from "../Unit/Model";
import { getUnitAttack, getUnitDamage } from "../Unit/Skills";
import { INVALID_STATE } from "../errors";
import { getMeleeTarget } from "./getMeleeTarget";
import { random } from "../utils/random";
import * as Squad from "../Squad/Model";
import { List } from "immutable";

const sortInitiative = (unit: Unit.Unit) => {
  return random(1, 6) + unit.dex;
};

export const initiativeList = (units: Unit.UnitIndex): List<string> =>
  units
    .toList()
    .sort((a, b) => sortInitiative(b) - sortInitiative(a))
    .map((u) => u.id);

export type Move = { type: "MOVE"; source: string; target: string };
export type Return = { type: "RETURN"; target: string };
export type Slash = {
  type: "SLASH";
  source: string;
  target: string;
  damage: number;
  updatedTarget: Unit.Unit;
  updatedSource: Unit.Unit;
};
export type Shoot = {
  type: "SHOOT";
  source: string;
  target: string;
  damage: number;
  updatedTarget: Unit.Unit;
  updatedSource: Unit.Unit;
};
export type Fireball = {
  type: "FIREBALL";
  source: string;
  target: string;
  damage: number;
  updatedTarget: Unit.Unit;
  updatedSource: Unit.Unit;
};
export type Victory = {
  type: "VICTORY";
  target: string;
  units: Unit.UnitIndex;
};
export type EndCombat = { type: "END_COMBAT"; units: Unit.UnitIndex };
export type EndTurn = { type: "END_TURN" };
export type RestartTurns = { type: "RESTART_TURNS" };
export type DisplayXP = {
  type: "DISPLAY_XP";
  xpInfo: List<XPInfo>;
};

export type XPInfo = {
  xp: number;
  lvls: number;
  id: string;
};

const displayXPCmd = (xpInfo: List<XPInfo>): DisplayXP => ({
  type: "DISPLAY_XP",
  xpInfo,
});

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

export const runCombat = (
  squadIndex: Squad.Index,
  unitIndex: Unit.UnitIndex
): Command[] => {
  const remainingAttacksIndex: RemainingAttacksIndex = unitIndex
    .map((unit) => ({
      id: unit.id,
      remainingAttacks: getUnitAttack(squadIndex, unit).times,
    }))
    .reduce(
      (xs, x) => ({ ...xs, [x.id]: x.remainingAttacks }),
      {} as RemainingAttacksIndex
    );

  const initiative = initiativeList(unitIndex);

  const initialTurnState: TurnState = {
    unitIndex: unitIndex,
    squadIndex: squadIndex,
    initiative,
    remainingAttacksIndex,
    turn: 0,
  };
  return runTurn(initialTurnState, []);
};

export type TurnState = {
  unitIndex: Unit.UnitIndex;
  squadIndex: Squad.Index;
  initiative: List<string>;
  remainingAttacksIndex: RemainingAttacksIndex;
  turn: number;
};

/** Unit that is guaranteed to be in a squad */
export type UnitInSquad = Unit.Unit & { squad: string };

export type RemainingAttacksIndex = { [id: string]: number };

export const runTurn = (
  turnState: TurnState,
  commands: Command[]
): Command[] => {
  const {
    unitIndex,
    squadIndex,
    initiative,
    remainingAttacksIndex,
    turn,
  } = turnState;

  const currentUnitId = initiative.get(turn);
  const remainingAttacks = remainingAttacksIndex[currentUnitId];
  const unit = unitIndex.get(currentUnitId);
  const isLast = initiative.size - 1 === turn;

  const nextTurn = isLast ? 0 : turn + 1;

  let turnCommands: Command[] = [];
  let updatedUnits = unitIndex;

  const hasRemainingAttacks = remainingAttacks > 0;

  if (hasRemainingAttacks && Unit.isAlive(unit)) {
    let res;
    switch (unit.class) {
      case "archer":
        // res = rangedAttackSingleTarget(
        //   squadIndex,
        //   currentUnitId,
        //   units,
        //   commands
        // );
        // turnCommands = res.commands;
        // updatedUnits = res.updatedUnits;
        break;
      case "mage":
        // res = rangedSpellSingleTarget(
        //   squadIndex,
        //   currentUnitId,
        //   units,
        //   commands
        // );
        // turnCommands = res.commands;
        // updatedUnits = res.updatedUnits;
        break;
      case "fighter":
        res = meleeAttackSingleTarget(turnState, commands);
        turnCommands = res.commands;
        turnState.unitIndex = res.updatedUnits;
        turnState.remainingAttacksIndex = res.remainingAttacks;
        break;
      default:
        break;
    }
  } else {
    turnCommands = commands;
  }

  const { squad } = unit;

  const victory = (units: Unit.UnitIndex): Victory => ({
    type: "VICTORY",
    target: squad,
    units,
  });

  const { unitsWithXp, cmds: xpCmds } = calcXp(squadIndex, updatedUnits);

  const endCombat: (cmds: Command[]) => Command[] = (commands: Command[]) => {
    return commands
      .concat(xpCmds)
      .concat([{ type: "END_COMBAT", units: unitsWithXp.map((u) => u.unit) }]);
  };

  turnState.unitIndex = updatedUnits;

  if (isVictory(currentUnitId, updatedUnits)) {
    return turnCommands.concat(xpCmds).concat([victory(updatedUnits)]);
  } else if (noAttacksRemaining(updatedUnits, remainingAttacksIndex)) {
    return endCombat(turnCommands);
  } else {
    return runTurn({ ...turnState, turn: nextTurn }, turnCommands);
  }
};

function calcXp(squadIndex: Squad.Index, units: Unit.UnitIndex) {
  const squadXp = squadIndex.map((squad) => {
    const enemyUnits = units.filter((u) => u.squad !== squad.id);

    const deadEnemies = enemyUnits
      .map((u) => (u.currentHp < 1 ? 1 : 0))
      .reduce((xs, x) => xs + x, 0);

    const xpAmount = deadEnemies * 40;

    return { squadId: squad.id, xpAmount };
  });

  const MAX_XP = 100;

  const unitsWithXp = units.map((unit) => {
    const { xpAmount } = squadXp.get(unit.squad);

    if (xpAmount < 1) return { xp: 0, lvls: 0, unit };

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

  const xps = unitsWithXp
    .filter(({ xp, lvls }) => xp > 0 || lvls > 0)
    .map(({ unit, xp, lvls }) => ({ id: unit.id, xp, lvls }))
    .toList();

  return {
    unitsWithXp,
    cmds: xps.size > 0 ? [displayXPCmd(xps)] : [],
  };
}

function meleeAttackSingleTarget(state: TurnState, commands: Command[]) {
  const {
    unitIndex,
    squadIndex,
    initiative,
    remainingAttacksIndex,
    turn,
  } = state;

  const id = initiative.get(turn);
  const current = unitIndex.get(id);
  const target = getMeleeTarget(current, unitIndex, squadIndex);

  const damage = getUnitDamage(squadIndex, current);

  const targetUnit = unitIndex.get(target.id);
  const newHp = targetUnit.currentHp - damage;
  const currentHp = newHp < 1 ? 0 : newHp;

  const updatedUnits = Unit.update({ ...unitIndex.get(target.id), currentHp })(
    unitIndex
  );

  const updatedRemainingAttacksIndex = {
    ...remainingAttacksIndex,
    [current.id]: remainingAttacksIndex[current.id] - 1,
  };

  const updatedTarget = updatedUnits.get(target.id);

  const updatedSource = updatedUnits.get(current.id);

  if (!updatedTarget || !updatedSource) throw new Error(INVALID_STATE);

  const move: Command[] = [
    { type: "MOVE", source: current.id, target: target.id },
  ];
  const slash: Command[] = [
    {
      type: "SLASH",
      source: current.id,
      target: target.id,
      damage,
      updatedTarget: updatedTarget,
      updatedSource: updatedSource,
    },
  ];

  const returnCmd: Command[] = [{ type: "RETURN", target: current.id }];

  return {
    commands: commands.concat(move).concat(slash).concat(returnCmd),
    updatedUnits,
    remainingAttacks: updatedRemainingAttacksIndex,
  };
}

// function rangedAttackSingleTarget(
//   squadIndex: SquadIndex,
//   current: TurnUnit,
//   units: TurnUnit[],
//   commands: Command[]
// ) {
//   return;
// const target = getTarget(squadIndex, current.unit, units);

// if (!target) throw new Error(INVALID_STATE);

// const damage = getUnitDamage(current.unit);

// const updatedUnits = units
//   .map((unit) => {
//     const newHp = unit.unit.currentHp - damage;
//     const currentHp = newHp < 1 ? 0 : newHp;

//     return unit.unit.id === target.id
//       ? {
//           remainingAttacks: unit.remainingAttacks,
//           unit: { ...unit.unit, currentHp },
//         }
//       : unit;
//   })
//   .map((unit) => {
//     return unit.unit.id === current.unit.id
//       ? {
//           remainingAttacks: unit.remainingAttacks - 1,
//           unit: { ...unit.unit },
//         }
//       : unit;
//   });

// const updatedTarget = updatedUnits.find((u) => u.unit.id === target.id);

// const updatedSource = updatedUnits.find((u) => u.unit.id === current.unit.id);

// if (!updatedTarget || !updatedSource) throw new Error(INVALID_STATE);

// const useBow: Command[] = [
//   {
//     type: "SHOOT",
//     source: current.unit.id,
//     target: target.id,
//     damage,
//     updatedTarget: updatedTarget.unit,
//     updatedSource: updatedSource.unit,
//   },
// ];

// return {
//   commands: commands.concat(useBow),
//   updatedUnits,
// };
// }
// function rangedSpellSingleTarget(
//   squadIndex: SquadIndex,
//   current: TurnUnit,
//   units: TurnUnit[],
//   commands: Command[]
// ) {
//   return;
// const target = getTarget(squadIndex, current.unit, units);

// if (!target) throw new Error(INVALID_STATE);

// const damage = getUnitDamage(current.unit);

// const updatedUnits = units
//   .map((unit) => {
//     const newHp = unit.unit.currentHp - damage;
//     const currentHp = newHp < 1 ? 0 : newHp;

//     return unit.unit.id === target.id
//       ? {
//           remainingAttacks: unit.remainingAttacks,
//           unit: { ...unit.unit, currentHp },
//         }
//       : unit;
//   })
//   .map((unit) => {
//     return unit.unit.id === current.unit.id
//       ? {
//           remainingAttacks: unit.remainingAttacks - 1,
//           unit: { ...unit.unit },
//         }
//       : unit;
//   });

// const updatedTarget = updatedUnits.find((u) => u.unit.id === target.id);

// const updatedSource = updatedUnits.find((u) => u.unit.id === current.unit.id);

// if (!updatedTarget || !updatedSource) throw new Error(INVALID_STATE);

// const useFireball: Command[] = [
//   {
//     type: "FIREBALL",
//     source: current.unit.id,
//     target: target.id,
//     damage,
//     updatedTarget: updatedTarget.unit,
//     updatedSource: updatedSource.unit,
//   },
// ];

// return {
//   commands: commands.concat(useFireball),
//   updatedUnits,
// };
// }

function isVictory(current: string, units: Unit.UnitIndex) {
  return units
    .filter(isFromAnotherSquad(units.get(current)))
    .every((enemy) => !Unit.isAlive(enemy));
}

function noAttacksRemaining(
  units: Unit.UnitIndex,
  remainingAttacks: RemainingAttacksIndex
) {
  return units.filter(Unit.isAlive).every((u) => remainingAttacks[u.id] < 1);
}

export function isFromAnotherSquad(current: UnitInSquad) {
  return function (unit: UnitInSquad) {
    return current.squad !== unit.squad;
  };
}
