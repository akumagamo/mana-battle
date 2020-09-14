import {UnitClass, Unit, UnitMap} from './Unit/Model';
import {
  Item,
  ItemType,
  Modifier,
  itemTypeSlots,
  modifiers,
  ItemModifiers,
  ItemSlot,
  ItemMap,
  ItemTypeSlots,
} from './Item/Model';
import itemsJSON from './constants/items.json';
import {idfy} from './utils/idfy';
import {fromJSON} from './Unit/serializer';
import {indexById} from './utils';
import {SquadMap} from './Squad/Model';
import {Player} from './Player/Model';
import {Range} from 'immutable'
import {Options} from './Models';
import {BattleFieldMap, PLAYER_FORCE} from './API/Map/Model';

export const classes: UnitClass[] = ['fighter', 'mage', 'archer'];

export function randomItem<T>(items: Array<T>): T {
  return items[Math.floor(Math.random() * items.length)];
}

export var units: UnitMap = indexById(
  Array.from({length: 20}, (_, i) => i).map((unitJSON) => fromJSON(unitJSON)),
);

function squad(n: number, leader: Unit) {
  leader.squad = { id: n.toString(), x:2, y:2};

  return {
    id: n.toString(),
    name: leader.name,
    emblem: 'Emoji',
    force: PLAYER_FORCE,
    members: {
      [leader.id]: {id: leader.id, leader: true, x: 2, y: 2},
    },
  };
}

export var squads: SquadMap = {};
for (var j = 0; j < 10; j++) squads[j.toString()] = squad(j, units[j]);

function makeItem(acc: Item[], itemData: any): Item[] {
  const {type, name} = itemData;

  const modifierList = Object.keys(modifiers) as Modifier[];

  const reduceModifiers = (acc: ItemModifiers, [k, v]: [Modifier, string]) => {
    if (modifierList.includes(k)) return {...acc, [k]: parseInt(v)};
    else return acc;
  };
  const itemModifierList = Object.entries(itemData).filter(
    ([k]) => !['name', 'type', 'description'].includes(k),
  );

  const itemModifiers: ItemModifiers = (itemModifierList as [
    Modifier,
    string,
  ][]).reduce(reduceModifiers, modifiers);

  const slot: ItemSlot = itemTypeSlots[type as ItemType];

  if (!itemTypeSlots[type as ItemType]) return acc;
  else
    return acc.concat([
      {
        id: idfy(itemData.name),
        name: name,
        type: type,
        slot: slot,
        description: itemData.description,
        modifiers: itemModifiers,
      },
    ]);
}

export var items: ItemMap = indexById(itemsJSON.reduce(makeItem, []));

export var player: Player = {
  id: 'player_1',
  name: 'Player Derp',
  gold: 100,
  iventory: {
    iron_sword: 2,
    steel_sword: 1,
  },
  units: ['1'],
  squads: ['1'],
};

const options:Options ={
  soundEnabled: true,
  musicEnabled: true
}

const data: [
  string,
  UnitMap | SquadMap | ItemMap | ItemTypeSlots | Player | Options | BattleFieldMap,
][] = [
  ['units', units],
  ['squads', squads],
  ['items', items],
  ['itemTypes', itemTypeSlots],
  ['player', player],
  ['options', options],
];

export const clearDB = () => {
  defaultData(true);
  alert('Data Cleared!');
};

const defaultData = (override: boolean) => {
  data.forEach(([k, v]) => {
    if (localStorage.getItem(k) === null || override)
      localStorage.setItem(k, JSON.stringify(v));
  });
};

export default defaultData;
