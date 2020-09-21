import {Modifier, ItemSlot, ItemMap, ItemType} from '../Item/Model';
import {sum} from '../utils/math';
import {Container} from '../Models';
import {getItem, getItems} from '../DB';
import {UnitAttacks} from './Skills';
import {City, ForceId, MapSquad as MapSquad} from '../API/Map/Model';
import {Squad} from '../Squad/Model';
import {Vector} from 'matter';

export type UnitMap = {[x: string]: Unit};

export type Stat = 'str' | 'dex' | 'int';

export type Gender = 'male' | 'female';

export type Elem =
  | 'fire'
  | 'water'
  | 'earth'
  | 'wind'
  | 'light'
  | 'shadow'
  | 'neutral';

export type UnitClass = 'fighter' | 'mage' | 'archer';

export const unitClassLabels: {[x in UnitClass]: string} = {
  archer: 'Archer',
  mage: 'Mage',
  fighter: 'Fighter',
};

export type Movement = 'plain' | 'mountain' | 'sky' | 'forest';

export type UnitSquadPosition = {id: string; x: number; y: number};

/**
 * Database representation of a unit. Contains basic data.
 */
export type Unit = {
  id: string;
  name: string;
  class: UnitClass;
  gender: Gender;
  movement: Movement;
  squad: UnitSquadPosition | null;
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
  leader?: boolean;
  attacks: UnitAttacks;
};
export type UnitInSquad = Unit & {squad: UnitSquadPosition};

export function assignSquad(unit: Unit, position: UnitSquadPosition):UnitInSquad {
  return {...unit, squad: position};
}

export function toMapSquad(
  squad: Squad,
  pos:Vector,
): MapSquad {
  return { ...squad,
    pos: {x:pos.x, y:pos.y},
    range: 5,
    validSteps: [],
    enemiesInRange: [],
    status: 'alive',
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
  unit: Unit,
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

  const item = items[itemId];

  if (!item) {
    throw new Error('Invalid State: Item should be in index');
  }

  const modifier = item.modifiers[stat];

  if (modifier) return modifier;
  else return 0;
}

const equipKeys: ItemSlot[] = ['mainHand', 'offHand', 'chest', 'ornament'];

export function getActualStat(stat: Stat, items: ItemMap, unit: Unit) {
  const value = unit[stat];

  const values = equipKeys.map((equip) =>
    getItemModifier({unit, stat, items, slot: equip}),
  );

  return value + values.reduce(sum, 0);
}

export function getUnitsWithoutSquad(map: UnitMap) {
  return Object.values(map).reduce(
    (acc, curr) => (curr.squad ? acc : {...acc, [curr.id]: curr}),
    {} as UnitMap,
  );
}

export const HAIR_STYLES = ['dark1', 'long1', 'split', 'long2', 'split2'];

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
  name: 'slash',
  formula: (unit) => {
    const items = getItems();
    const weapon = items[unit.equips.mainHand];
    const str = getActualStat('str', items, unit);
    const dex = getActualStat('dex', items, unit);

    return str + dex / 4 + weapon.modifiers.atk;
  },
  attacksPerRow: {
    front: 2,
    middle: 1,
    back: 1,
  },
};

const fighter: Job = {
  name: 'fighter',
  statsPerLevel: {
    str: 6,
    dex: 4,
    int: 2,
  },
  attack: slash,
  equips: {
    head: 'helm',
    mainHand: 'sword',
    offHand: 'shield',
    chest: 'heavy_armor',
    ornament: 'accessory',
  },
};
