import * as Unit from "../Unit/Model";
import { getUnitAttack, getUnitDamage } from "../Unit/Skills/Skills";
import { getMeleeTarget } from "./getMeleeTarget";
import { random } from "../utils/random";
import * as Squad from "../Squad/Model";
import { List, Map } from "immutable";
import { INVALID_STATE } from "../errors";

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
export type EndCombat = {
  type: "END_COMBAT";
  units: Unit.UnitIndex;
  squadDamage: Map<string, number>;
};
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
  squadIndex: Squad.SquadIndex,
  unitIndex: Unit.UnitIndex,
  unitSquadIndex: Squad.UnitSquadIndex
): Command[] => {
  const remainingAttacksIndex: RemainingAttacksIndex = unitIndex
    .map((unit) => ({
      id: unit.id,
      remainingAttacks: getUnitAttack(squadIndex, unit, unitSquadIndex).times,
    }))
    .reduce(
      (xs, x) => ({ ...xs, [x.id]: x.remainingAttacks }),
      {} as RemainingAttacksIndex
    );

  const initiative = initiativeList(unitIndex);

  const initialTurnState: TurnState = {
    unitIndex: unitIndex,
    squadIndex: squadIndex,
    unitSquadIndex: Squad.createUnitSquadIndex(squadIndex),
    initiative,
    remainingAttacksIndex,
    turn: 0,
    squadDamage: squadIndex.map(() => 0),
  };
  return runTurn(initialTurnState, []);
};

export type TurnState = {
  unitIndex: Unit.UnitIndex;
  unitSquadIndex: Squad.UnitSquadIndex;
  squadIndex: Squad.SquadIndex;
  initiative: List<string>;
  remainingAttacksIndex: RemainingAttacksIndex;
  turn: number;
  squadDamage: Map<string, number>;
};

/** Unit that is guaranteed to be in a squad */
export type UnitInSquad = Unit.Unit & { squad: string };

export type RemainingAttacksIndex = { [id: string]: number };

// TODO: remove mutations from this
export const runTurn = (
  turnState: TurnState,
  commands: Command[]
): Command[] => {
  const {
    unitIndex,
    unitSquadIndex,
    squadIndex,
    initiative,
    remainingAttacksIndex,
    turn,
  } = turnState;

  const currentUnitId = initiative.get(turn);
  if (!currentUnitId) throw new Error(INVALID_STATE);

  const remainingAttacks = remainingAttacksIndex[currentUnitId];
  const unit = Unit.getUnit(currentUnitId, unitIndex);
  const isLast = initiative.size - 1 === turn;

  const nextTurn = isLast ? 0 : turn + 1;

  let turnCommands: Command[] = [];

  const hasRemainingAttacks = remainingAttacks > 0;

  if (hasRemainingAttacks && Unit.isAlive(unit)) {
    let res;
    // TODO, FIXME: this is bad and ugly
    switch (unit.job) {
      case "fighter":
        res = slash(turnState, commands);
        turnCommands = res.commands;
        turnState.unitIndex = res.updatedUnits;
        turnState.remainingAttacksIndex = res.remainingAttacks;
        turnState.squadDamage = res.squadDamage;
        break;
      case "archer":
        res = shoot(turnState, commands);
        turnCommands = res.commands;
        turnState.unitIndex = res.updatedUnits;
        turnState.remainingAttacksIndex = res.remainingAttacks;
        turnState.squadDamage = res.squadDamage;
        break;
      case "mage":
        res = fireball(turnState, commands);
        turnCommands = res.commands;
        turnState.unitIndex = res.updatedUnits;
        turnState.remainingAttacksIndex = res.remainingAttacks;
        turnState.squadDamage = res.squadDamage;
        break;
    }
  } else {
    turnCommands = commands;
  }

  const squad = Squad.getUnitSquad(unit.id, squadIndex, unitSquadIndex).id;

  const victory = (units: Unit.UnitIndex): Victory => ({
    type: "VICTORY",
    target: squad,
    units,
  });

  const { unitsWithXp, cmds: xpCmds } = calcXp(
    squadIndex,
    turnState.unitIndex,
    unitSquadIndex
  );

  const endCombat: (cmds: Command[]) => Command[] = (commands: Command[]) => {
    return commands.concat(xpCmds).concat([
      {
        type: "END_COMBAT",
        units: unitsWithXp.map((u) => u.unit),
        squadDamage: turnState.squadDamage,
      },
    ]);
  };

  if (isVictory(currentUnitId, turnState.unitIndex, unitSquadIndex)) {
    return turnCommands.concat(xpCmds).concat([victory(turnState.unitIndex)]);
  } else if (noAttacksRemaining(turnState.unitIndex, remainingAttacksIndex)) {
    return endCombat(turnCommands);
  } else {
    return runTurn({ ...turnState, turn: nextTurn }, turnCommands);
  }
};

function calcXp(
  squadIndex: Squad.SquadIndex,
  units: Unit.UnitIndex,
  unitSquadIndex: Squad.UnitSquadIndex
) {
  const squadXp = squadIndex.map((squad) => {
    const enemyUnits = Squad.getSquadUnits(squad.id, units, unitSquadIndex);

    const deadEnemies = enemyUnits
      .map((u) => (u.currentHp < 1 ? 1 : 0))
      .reduce((xs, x) => xs + x, 0);

    const xpAmount = deadEnemies * 40;

    return { squadId: squad.id, xpAmount };
  });

  const MAX_XP = 100;

  const unitsWithXp = units.map((unit) => {
    const unitSquad = Squad.getUnitSquad(unit.id, squadIndex, unitSquadIndex);

    const xp = squadXp.get(unitSquad.id);
    if (!xp) throw new Error(INVALID_STATE);

    const { xpAmount } = xp;

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

function slash(state: TurnState, commands: Command[]) {
  const {
    unitIndex,
    squadIndex,
    unitSquadIndex,
    initiative,
    remainingAttacksIndex,
    turn,
    squadDamage,
  } = state;

  const id = initiative.get(turn);
  if (!id) throw new Error(INVALID_STATE);

  const current = Unit.getUnit(id, unitIndex);
  const target = getMeleeTarget(current, unitIndex, squadIndex, unitSquadIndex);

  const damage = getUnitDamage(squadIndex, current, unitSquadIndex);

  const targetUnit = Unit.getUnit(target.id, unitIndex);
  const newHp = targetUnit.currentHp - damage;
  const currentHp = newHp < 1 ? 0 : newHp;

  const updatedUnits = Unit.update({ ...targetUnit, currentHp })(unitIndex);

  const updatedRemainingAttacksIndex = {
    ...remainingAttacksIndex,
    [current.id]: remainingAttacksIndex[current.id] - 1,
  };

  const updatedTarget = Unit.getUnit(target.id, updatedUnits);

  const updatedSource = Unit.getUnit(current.id, updatedUnits);

  const move: Command = { type: "MOVE", source: current.id, target: target.id };
  const slash: Command = {
    type: "SLASH",
    source: current.id,
    target: target.id,
    damage,
    updatedTarget: updatedTarget,
    updatedSource: updatedSource,
  };

  const returnCmd: Command = { type: "RETURN", target: current.id };

  const currentSquad = Squad.getUnitSquad(
    current.id,
    squadIndex,
    unitSquadIndex
  );

  return {
    commands: commands.concat([move, slash, returnCmd]),
    updatedUnits,
    remainingAttacks: updatedRemainingAttacksIndex,
    squadDamage: squadDamage.update(currentSquad.id, (n) => n + damage),
  };
}

function shoot(state: TurnState, commands: Command[]) {
  const {
    unitIndex,
    squadIndex,
    initiative,
    remainingAttacksIndex,
    turn,
    squadDamage,
    unitSquadIndex,
  } = state;

  const id = initiative.get(turn);
  if (!id) throw new Error(INVALID_STATE);
  const current = Unit.getUnit(id, unitIndex);
  const target = getMeleeTarget(current, unitIndex, squadIndex, unitSquadIndex);

  const damage = getUnitDamage(squadIndex, current, unitSquadIndex);

  const targetUnit = Unit.getUnit(target.id, unitIndex);
  const newHp = targetUnit.currentHp - damage;
  const currentHp = newHp < 1 ? 0 : newHp;

  const updatedUnits = Unit.update({ ...targetUnit, currentHp })(unitIndex);

  const updatedRemainingAttacksIndex = {
    ...remainingAttacksIndex,
    [current.id]: remainingAttacksIndex[current.id] - 1,
  };

  const updatedTarget = Unit.getUnit(target.id, updatedUnits);

  const updatedSource = Unit.getUnit(current.id, updatedUnits);

  const shoot: Command = {
    type: "SHOOT",
    source: current.id,
    target: target.id,
    damage,
    updatedTarget: updatedTarget,
    updatedSource: updatedSource,
  };

  const currentSquad = Squad.getUnitSquad(
    current.id,
    squadIndex,
    unitSquadIndex
  );

  return {
    commands: commands.concat([shoot]),
    updatedUnits,
    remainingAttacks: updatedRemainingAttacksIndex,
    squadDamage: squadDamage.update(currentSquad.id, (n) => n + damage),
  };
}
function fireball(state: TurnState, commands: Command[]) {
  const {
    unitIndex,
    squadIndex,
    initiative,
    remainingAttacksIndex,
    turn,
    squadDamage,
    unitSquadIndex,
  } = state;

  const id = initiative.get(turn);
  if (!id) throw new Error(INVALID_STATE);
  const current = Unit.getUnit(id, unitIndex);
  const target = getMeleeTarget(current, unitIndex, squadIndex, unitSquadIndex);

  const damage = getUnitDamage(squadIndex, current, unitSquadIndex);

  const targetUnit = Unit.getUnit(target.id, unitIndex);
  const newHp = targetUnit.currentHp - damage;
  const currentHp = newHp < 1 ? 0 : newHp;

  const updatedUnits = Unit.update({ ...targetUnit, currentHp })(unitIndex);

  const updatedRemainingAttacksIndex = {
    ...remainingAttacksIndex,
    [current.id]: remainingAttacksIndex[current.id] - 1,
  };

  const updatedTarget = Unit.getUnit(target.id, updatedUnits);

  const updatedSource = Unit.getUnit(current.id, updatedUnits);

  const shoot: Command = {
    type: "FIREBALL",
    source: current.id,
    target: target.id,
    damage,
    updatedTarget: updatedTarget,
    updatedSource: updatedSource,
  };

  const currentSquad = Squad.getUnitSquad(
    current.id,
    squadIndex,
    unitSquadIndex
  );

  return {
    commands: commands.concat([shoot]),
    updatedUnits,
    remainingAttacks: updatedRemainingAttacksIndex,
    squadDamage: squadDamage.update(currentSquad.id, (n) => n + damage),
  };
}

function isVictory(
  current: string,
  units: Unit.UnitIndex,
  unitSquadIndex: Squad.UnitSquadIndex
) {
  return units
    .filter(isFromAnotherSquad(Unit.getUnit(current, units), unitSquadIndex))
    .every((enemy) => !Unit.isAlive(enemy));
}

function noAttacksRemaining(
  units: Unit.UnitIndex,
  remainingAttacks: RemainingAttacksIndex
) {
  return units.filter(Unit.isAlive).every((u) => remainingAttacks[u.id] < 1);
}

export function isFromAnotherSquad(
  current: Unit.Unit,
  index: Squad.UnitSquadIndex
) {
  return function (unit: Unit.Unit) {
    return index.get(current.id) !== index.get(unit.id);
  };
}
