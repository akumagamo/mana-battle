import * as Squad from "../Squad/Model";
import { random } from "../utils/random";
import { Elem, Unit, UnitClass } from "./Model";
import { atk, attrMod, mAtk } from "./mods";

export type Attack = {
  name: string;
  damage: number;
  elem: Elem;
};

type Row = "front" | "middle" | "back";

// TODO: should get total str (including other equips)
// TODO: should avoid getting items from DB
// TODO: unit should have atk attr. it should be recalc when
// changing items
const slash = (unit: Unit): Attack => {
  return {
    name: "Slash",
    damage: atk(unit) + attrMod(unit.str) + random(1, 6),
    elem: "neutral",
  };
};

const fireball = (unit: Unit): Attack => {
  return {
    name: "Fireball",
    damage: mAtk(unit) + attrMod(unit.int) + random(1, 6),
    elem: "fire",
  };
};
// const iceBolt = (times: number) => (unit: Unit): Attack => {
//   return {
//     name: "Ice Bold",
//     damage: mAtk(unit) + attrMod(unit.int) + random(1, 6),
//     elem: "water",
//     times: times,
//   };
// };

const shoot = (unit: Unit): Attack => {
  return {
    name: "Shoot",
    damage: atk(unit) + attrMod(unit.dex) + random(1, 6),
    elem: "neutral",
  };
};

// const spell = (times: number) => (unit: Unit) => {
//   if (unit.elem === "fire") return fireball(times);
//   else if (unit.elem === "water") return iceBolt(times);
//   else return fireball;
// };

export type UnitAttacks = {
  [x in Row]: {
    times: number;
    skill: (u: Unit) => Attack;
  };
};

export const skillsIndex: { [x in UnitClass]: UnitAttacks } = {
  fighter: {
    front: { times: 2, skill: slash },
    middle: { times: 1, skill: slash },
    back: { times: 1, skill: slash },
  },
  mage: {
    front: { times: 1, skill: fireball },
    middle: { times: 1, skill: fireball },
    back: { times: 2, skill: fireball },
  },
  archer: {
    front: { times: 1, skill: shoot },
    middle: { times: 1, skill: shoot },
    back: { times: 2, skill: shoot },
  },
};

export function getUnitAttacks(class_: UnitClass) {
  return skillsIndex[class_];
}

export function getUnitDamage(squadIndex: Squad.Index, unit: Unit) {
  return getUnitAttack(squadIndex, unit).skill(unit).damage;
}

export function getUnitAttack(squadIndex: Squad.Index, unit: Unit) {
  const member = Squad.getMember(unit.id, squadIndex.get(unit.squad));
  const getPos = (): Row => {
    if (member.y === 0) return "back";
    else if (member.y === 1) return "middle";
    else return "front";
  };

  return getUnitAttacks(unit.class)[getPos()];
}
