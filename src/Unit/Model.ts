import { Modifier, ItemSlot, ItemMap, ItemType } from "../Item/Model";
import { sum } from "../utils/math";
import { Container } from "../Models";
import { skillsIndex, UnitAttacks } from "./Skills";
import { MapSquad, Vector } from "../Battlefield/Model";
import { SquadRecord } from "../Squad/Model";
import { Map } from "immutable";
import { cellToScreenPosition } from "../Battlefield/board/position";
import { CPU_FORCE } from "../constants";

// todo: refactor all operations that perform transformations on units and unitindexes
// to use functions from here

export type UnitIndex = Map<string, UnitInSquad>;

export type Stat = "str" | "dex" | "int";
export const statLabels: {
  [stat in Stat]: string;
} = {
  str: "Strength",
  dex: "Dexterity",
  int: "Intelligence",
};

export enum Gender {
  Male = "male",
  Female = "female",
}
export const genders: Gender[] = [Gender.Male, Gender.Female];
export const genderLabels: { [gender in Gender]: string } = {
  male: "Male",
  female: "Female",
};

export type Elem =
  | "fire"
  | "water"
  | "earth"
  | "wind"
  | "light"
  | "shadow"
  | "neutral";

export type UnitJobs = "fighter" | "mage" | "archer";

export const unitJobLabels: { [x in UnitJobs]: string } = {
  archer: "Archer",
  mage: "Mage",
  fighter: "Fighter",
};

export type Movement = "plain" | "mountain" | "sky" | "forest";

export const update = (unit: Unit) => (index: UnitIndex) =>
  index.set(unit.id, unit);

export type Unit = {
  id: string;
  name: string;
  job: UnitJobs;
  gender: Gender;
  movement: Movement;
  squad: string | null; // todo: remove
  force: string;
  lvl: number;
  hp: number;
  currentHp: number;
  exp: number;
  str: number;
  dex: number;
  int: number;
  style: {
    skinColor: number;
    hairColor: number;
    hair: string;
    displayHat: boolean;
  };
  equips: {
    [x in ItemSlot]: string;
  };
  elem: Elem;
  //attacks: UnitAttacks;
};

export const createUnit = (id: string): Unit => ({
  id,
  name: "",
  job: "fighter",
  gender: "male" as Gender,
  movement: "plain", // this should belong to a job
  squad: null,
  force: CPU_FORCE,
  lvl: 1,
  hp: 50,
  currentHp: 50,
  exp: 0,
  str: 10,
  dex: 10,
  int: 10,
  style: {
    skinColor: 1,
    hairColor: 1,
    hair: "short",
    displayHat: true,
  },
  equips: {
    mainHand: "",
    offHand: "",
    chest: "",
    ornament: "",
    head: "",
  },
  elem: "fire",
});

export type UnitInSquad = Unit & { squad: string };

export function assignSquad(unit: Unit, squad: string): UnitInSquad {
  return { ...unit, squad };
}

export function toMapSquad(
  squad: SquadRecord,
  pos: Vector,
  dispatchTime = 0
): MapSquad {
  return {
    id: squad.id,
    squad,
    pos: cellToScreenPosition({ x: pos.x, y: pos.y }),
    status: "standing",
  };
}

interface Animated {
  tweens: Phaser.Tweens.Tween[];
  container: Container;
}

/**
 * Object actually rendered on screen. Contains Phaser artifacts and
 * data derived from the Unit type
 */
export type AnimatedUnit = Unit & Animated;

export const makeAnimatedUnit: (
  scene: Phaser.Scene,
  unit: Unit
) => AnimatedUnit = (scene: Phaser.Scene, unit: Unit) => {
  return {
    ...unit,
    container: scene.add.container(0, 0),
    tweens: [],
  };
};

function getItemModifier({
  unit,
  stat,
  items,
  slot,
}: {
  unit: Unit;
  stat: Modifier;
  items: ItemMap;
  slot: ItemSlot;
}) {
  const itemId = unit.equips[slot];

  const item = items.get(itemId);

  if (!item) {
    throw new Error("Invalid State: Item should be in index");
  }

  const modifier = item.modifiers[stat];

  if (modifier) return modifier;
  else return 0;
}

const equipKeys: ItemSlot[] = ["mainHand", "offHand", "chest", "ornament"];

export function getActualStat(stat: Stat, items: ItemMap, unit: Unit) {
  const value = unit[stat];

  const values = equipKeys.map((equip) =>
    getItemModifier({ unit, stat, items, slot: equip })
  );

  return value + values.reduce(sum, 0);
}

export const HAIR_STYLES = [
  "dark1",
  "long1",
  "split",
  "long2",
  "split2",
  "female1",
  "female2",
  "male1",
];

export type Skill = {
  name: string;
  formula: (u: Unit) => number;
  attacksPerRow: {
    front: number;
    middle: number;
    back: number;
  };
};

export type Job = {
  name: string;
  statsPerLevel: {
    str: number;
    dex: number;
    int: number;
  };
  attack: Skill;
  equips: {
    [x in ItemSlot]: ItemType;
  };
};

const slash: Skill = {
  name: "slash",
  formula: (unit) => {
    // const items = getItemsFromDB();
    // const weapon = items.get( unit.equips.mainHand );
    // const str = getActualStat('str', items, unit);
    // const dex = getActualStat('dex', items, unit);

    // return str + dex / 4 + weapon.modifiers.atk;
    return 3;
  },
  attacksPerRow: {
    front: 2,
    middle: 1,
    back: 1,
  },
};

export const fighter: Job = {
  name: "fighter",
  statsPerLevel: {
    str: 6,
    dex: 4,
    int: 2,
  },
  attack: slash,
  equips: {
    head: "helm",
    mainHand: "sword",
    offHand: "shield",
    chest: "heavy_armor",
    ornament: "accessory",
  },
};

export function isAlive(unit: Unit) {
  return unit.currentHp > 0;
}

export const unitsWithoutSquad = (unitMap: UnitIndex) =>
  unitMap.filter((unit) => unit.squad === null);
