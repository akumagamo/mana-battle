import {UnitClass, UnitMap} from './Unit/Model';
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
import {indexById} from './utils';
import {SquadMap} from './Squad/Model';
import {Player} from './Player/Model';
import {Options} from './Models';
import {BattleFieldMap} from './Map/Model';
import {fighterArcherSquad} from './Squad/mocks';
import {PLAYER_FORCE} from './constants';

export const classes: UnitClass[] = ['fighter', 'mage', 'archer'];


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

const squadA = fighterArcherSquad(PLAYER_FORCE, 'player_1_', 'player_1_')
const squadB = fighterArcherSquad(PLAYER_FORCE, 'player_2_', 'player_2_')


const units = {...squadA.units, ...squadB.units}
const squads = {...squadA.squad, ...squadB.squad}

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
