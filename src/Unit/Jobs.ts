import { HAIR_COLORS, SKIN_COLORS } from "../Chara/animations/constants";
import { maleNames } from "../constants/names";
import { randomItem } from "../utils";
import { Elem, Gender, HAIR_STYLES, Movement, Unit, UnitClass } from "./Model";
import { getUnitAttacks } from "./Skills";

export const baseEquips = {
  mage: {
    ornament: "amulet",
    chest: "robe",
    mainHand: "oaken_staff",
    offHand: "none",
    head: "wiz_hat",
  },
  fighter: {
    ornament: "amulet",
    chest: "iron_armor",
    mainHand: "iron_sword",
    offHand: "iron_shield",
    head: "iron_helm",
  },
  archer: {
    ornament: "amulet",
    chest: "leather_armor",
    mainHand: "bow",
    offHand: "none",
    head: "archer_hat",
  },
};

export function makeUnit(
  class_: UnitClass,
  id: number | string,
  lvl: number
): Unit {
  const baseStats: {
    [job in UnitClass]: { hp: number; str: number; dex: number; int: number };
  } = {
    fighter: {
      hp: 80,
      str: 18,
      dex: 15,
      int: 11,
    },
    mage: {
      hp: 60,
      str: 10,
      dex: 12,
      int: 20,
    },
    archer: {
      hp: 70,
      str: 13,
      dex: 18,
      int: 12,
    },
  };

  return {
    name: randomItem(maleNames),
    id: typeof id === "string" ? id : id.toString(),
    class: class_,
    equips: baseEquips[class_],
    lvl,
    attacks: getUnitAttacks(class_),
    movement: "plain" as Movement,
    elem: "neutral" as Elem,
    gender: randomItem(["male", "female"] as Gender[]),
    exp: 0,
    squad: null,
    style: {
      skinColor: randomItem(SKIN_COLORS),
      hairColor: randomItem(HAIR_COLORS),
      hair: randomItem(HAIR_STYLES),
      displayHat: randomItem([true, false]),
    },
    ...baseStats[class_],
    currentHp: baseStats[class_].hp,
  };
}
