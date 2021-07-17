import { JOBS } from "../Jobs/Jobs";
import { Unit, Elem, UnitJobs } from "../Model";
import { fireball } from "./fireball";
import { shoot } from "./shoot";
import { slash } from "./slash";
import * as Squad from "../../Squad/Model";
import { INVALID_STATE } from "../../errors";

export type Skill = {
  id: string;
  name: string;
  formula: (u: Unit) => number;
  elem: Elem;
};

export const SKILLS = {
  slash: slash,
  shoot: shoot,
  fireball: fireball,
};
export type Attack = {
  name: string;
  damage: number;
  elem: Elem;
};

export type Row = "front" | "middle" | "back";

export type UnitAttacks = {
  [x in Row]: {
    times: number;
    skill: (u: Unit) => Attack;
  };
};

export function getUnitAttacks(job: UnitJobs) {
  return JOBS[job].attacks;
}

export function getUnitDamage(
  squadIndex: Squad.SquadIndex,
  unit: Unit,
  unitSquadIndex: Squad.UnitSquadIndex
) {
  return getUnitAttack(squadIndex, unit, unitSquadIndex).skill.formula(unit);
}

export function getUnitAttack(
  squadIndex: Squad.SquadIndex,
  unit: Unit,
  unitSquadIndex: Squad.UnitSquadIndex
) {
  const squadId = unitSquadIndex.get(unit.id);
  if (!squadId) throw new Error(INVALID_STATE);

  const squad = squadIndex.get(squadId);
  if (!squad) throw new Error(INVALID_STATE);

  const member = Squad.getMember(unit.id, squad);
  if (!member) throw new Error(INVALID_STATE);

  const getPos = (): Row => {
    if (member.y === 0) return "back";
    else if (member.y === 1) return "middle";
    else return "front";
  };

  return getUnitAttacks(unit.job)[getPos()];
}
