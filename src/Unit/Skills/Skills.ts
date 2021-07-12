import { JOBS } from "../Jobs/Jobs";
import { Unit, Elem, UnitJobs } from "../Model";
import { fireball } from "./fireball";
import { shoot } from "./shoot";
import { slash } from "./slash";
import * as Squad from "../../Squad/Model";

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

export function getUnitDamage(squadIndex: Squad.Index, unit: Unit) {
  return getUnitAttack(squadIndex, unit).skill.formula(unit);
}

export function getUnitAttack(squadIndex: Squad.Index, unit: Unit) {
  const member = Squad.getMember(unit.id, squadIndex.get(unit.squad));
  const getPos = (): Row => {
    if (member.y === 0) return "back";
    else if (member.y === 1) return "middle";
    else return "front";
  };

  return getUnitAttacks(unit.job)[getPos()];
}
