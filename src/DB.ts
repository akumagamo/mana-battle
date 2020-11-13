import {Squad, SquadMember, SquadMemberMap, SquadMap} from './Squad/Model';
import {unitsWithoutSquadSelector} from './Unit/selectors';
import {Item, itemTypeSlots, ItemTypeSlots, ItemMap} from './Item/Model';
import {Unit, UnitMap, UnitSquadPosition} from './Unit/Model';
import {removeIdFromMap} from './utils';
import {INVALID_STATE} from './errors';
import {Options} from './Models';
import {BattleFieldMap, PLAYER_FORCE} from './API/Map/Model';
import {getUnitAttacks} from './Unit/Skills';

const get = (str: string) => JSON.parse(localStorage.getItem(str) || '{}');
const set = (str: string, data: any) =>
  localStorage.setItem(str, JSON.stringify(data));

export const getSquads = (): SquadMap => get('squads');

export const getSquad = (id: string): Squad => {
  const squad = Object.values(getSquads()).find((squad) => squad.id === id);
  if (!squad) throw new Error(INVALID_STATE);
  return squad;
};

export const getSquadMembers = (id: string): Unit[] => {
  const squad = getSquad(id);

  return Object.values(squad.members)
    .map((unit) => getUnit(unit.id))
    .filter((a) => a) as Unit[];
};

export const getSquadMember = (id: string): SquadMember => {
  const unit = getUnit(id);
  if (!unit || !unit.squad) throw new Error(INVALID_STATE);
  const squad = getSquad(unit.squad.id);

  return Object.values(squad.members).find(
    (unit) => unit.id === id,
  ) as SquadMember;
};

export const getSquadLeader = (id: string): Unit => {
  const members = getSquadMembers(id);

  const unit = members.find((unit) => unit.id === id);

  if (!unit) throw new Error(INVALID_STATE);
  return unit;
};

export const getUnits = (): UnitMap => {

  let units = get('units')

  for(let k in units)
    units[k].attacks = getUnitAttacks(units[k].class)

  return units

};

export const getItems = (): ItemMap => get('items');
export const getItem = (id: string): Item => {
  const item = getItems()[id];
  if (!item) throw new Error(INVALID_STATE);
  return item;
};
export const getItemList = (): Item[] => Object.values(getItems());

export const getItemTypes = (): ItemTypeSlots => itemTypeSlots;

export const getUnit = (id: string): Unit => {
  const unit = getUnits()[id];

  unit.attacks = getUnitAttacks(unit.class);

  if (!unit) throw new Error(INVALID_STATE);

  return unit;
};

export const saveSquads = (squads: SquadMap) => set('squads', squads);

export const saveUnits = (units: UnitMap) => {
  const unitsToSave = {};

  for (let k in units) {
    //@ts-ignore
    unitsToSave[k] = {...units[k]};
    //@ts-ignore
    delete unitsToSave[k].attacks;
  }

  set('units', unitsToSave);
};

export const saveItems = (items: ItemMap) => set('items', items);

export const saveSquad = (squad: Squad) => {
  const squads = getSquads();
  saveSquads({...squads, [squad.id]: squad});
};

// Unit queries

export const saveUnit = (unit: Unit) => {
  const units = getUnits();
  saveUnits({...units, [unit.id]: unit});
};

/** Persists unit representation in squad map */
export const saveSquadUnit = ({
  squadId,
  unitId,
  x,
  y,
}: {
  squadId: string;
  unitId: string;
  x: number;
  y: number;
}) => {
  console.log(`save squad unit`, squadId, unitId, x, y);
  const squads = getSquads();
  const squad = squads[squadId];
  saveSquads({
    ...squads,
    [squadId]: {
      ...squad,
      members: {
        ...squad.members,
        [unitId]: {
          id: unitId,
          x,
          y,
          leader: squad.members[unitId]?.leader === true,
        },
      },
    },
  });
};

export const disbandSquad = (id: string) => {
  const squads = getSquads();

  const squadToRemove = squads[id];

  Object.values(squadToRemove.members).forEach((member) =>
    removeUnitFromSquad(member.id, squadToRemove),
  );

  const updatedSquads = removeIdFromMap(id, squads);
  saveSquads(updatedSquads);
};

export const unitsWithoutSquad = () => unitsWithoutSquadSelector(getUnits());

export const addUnitToSquad = (
  unit: Unit,
  squad: Squad,
  x: number,
  y: number,
) => {
  const {members} = squad;

  const newEntry = {
    leader: Object.keys(members).length === 0,
    x,
    y,
    id: unit.id,
  };
  console.log(`NEW ENTRY`, newEntry);

  const unitInTargetPosition = Object.values(members).find(
    (member) => member.x === x && member.y === y,
  );

  if (unitInTargetPosition) {
    console.log(`REMOVE EXISTING`);

    const remainingMembers = Object.values(members).filter(
      (member) => member.id !== unitInTargetPosition.id,
    );
    const updatedMembers = remainingMembers
      .concat([newEntry])
      .reduce((acc, curr) => ({...acc, [curr.id]: curr}), {});

    //TODO: as only one unit can be the leader, the `leader` prop should be from the squad:
    const updatedSquad = {
      ...squad,
      members: updatedMembers as SquadMemberMap,
    };

    const removedUnit = getUnit(unitInTargetPosition.id);

    if (!removedUnit) throw new Error(INVALID_STATE);

    saveUnit({...removedUnit, squad: null});
    saveUnit({
      ...unit,
      squad: {
        id: squad.id,
        x: members[unit.id].x,
        y: members[unit.id].y,
      },
    });
    saveSquad(updatedSquad);

    return updatedSquad;
  } else {

    // Add unit to squad
    const updatedMembers = {...members, [unit.id]: newEntry};

    const updatedSquad = {
      ...squad,
      members: updatedMembers,
      name: newEntry.leader ? unit.name : squad.name,
    };

    saveUnit({
      ...unit,
      squad: {
        id: squad.id,
        x,
        y,
      },
    });
    saveSquad(updatedSquad);

    return updatedSquad;
  }
};

// TODO: add new fn for units coming from outside the board
export const changeSquadMemberPosition = (
  unit: SquadMember,
  squad: Squad,
  x: number,
  y: number,
) => {
  console.log('change position', unit, squad, x, y);
  const {members} = squad;

  const updatedBoard = placeUnitInBoard(x, y, unit, members);

  console.log(`ujpdated board`, updatedBoard);

  const updatedSquad = {...squad, members: updatedBoard.members};

  console.log(`will save updatedSquad`, updatedSquad);
  saveSquad(updatedSquad);

  console.log(`will return`, updatedBoard);

  return updatedBoard;
};

function placeUnitInBoard(
  x: number,
  y: number,
  unit: SquadMember,
  members: SquadMemberMap,
) {
  const newEntry: SquadMember = {
    leader: unit.leader,
    x,
    y,
    id: unit.id,
  };

  const unitInTargetPosition = Object.values(members).find(
    (member) => member.x === x && member.y === y,
  );

  if (unitInTargetPosition) {
    const unitToReplace: SquadMember = {
      ...unitInTargetPosition,
      x: unit.x,
      y: unit.y,
    };

    return {
      members: {
        ...members,
        [unit.id]: newEntry,
        [unitInTargetPosition.id]: unitToReplace,
      },
      updatedUnits: [
        {id: unit.id, x, y},
        {id: unitInTargetPosition.id, x: unit.x, y: unit.y},
      ],
    };
  } else {
    return {
      members: {...members, [unit.id]: newEntry},
      updatedUnits: [{id: unit.id, x, y}],
    };
  }
}

export const removeUnitFromSquad = (unitId: string, squad: Squad) => {
  const unit = getUnit(unitId);
  if (!unit) {
    throw new Error('ERROR: tried to save unit with invalid ID');
  }
  const updatedUnit = {...unit, squad: (null as UnitSquadPosition|null)};

  const {members} = squad;

  const updatedMembers: SquadMemberMap = removeIdFromMap(unitId, members);

  const updatedSquad = {...squad, members: updatedMembers};

  saveUnit(updatedUnit);
  saveSquad(updatedSquad);
};

export const createSquad = (leader: Unit) => {
  const squads = getSquads();
  const newId = squads.length.toString();

  let defaultX = 2;
  let defaultY = 2;

  const newSquad = {
    id: newId,
    name: leader.name,
    emblem: 'Emoji',
    force: PLAYER_FORCE,
    members: {
      [leader.id]: {id: leader.id, leader: true, x: defaultX, y: defaultY},
    },
  };
  const updatedSquads = {
    ...squads,
    [newId]: newSquad,
  };

  const updatedUnit = {...leader, squad: {id: newId, x: defaultX, y: defaultY}};
  const fn = (
    resolve: ({units, squads}: {units: UnitMap; squads: SquadMap}) => void,
  ) => {
    saveSquads(updatedSquads);
    saveUnit(updatedUnit);
    const units = getUnits();
    console.log(units, updatedSquads);
    resolve({units, squads: updatedSquads});
  };

  return new Promise(fn);
};

export const equipItem = (itemId: string, unitId: string) => {
  const unit = getUnit(unitId);
  const item = getItem(itemId);

  if (!unit) throw new Error('An invalid unit id was supplied to equipItem');
  if (!item) throw new Error('An invalid item id was supplied to equipItem');

  const slot = getItemTypes()[item.type];

  const updatedUnit = {...unit, equips: {...unit.equips, [slot]: item.id}};

  saveUnit(updatedUnit);
};

export const getOptions = (): Options => get('options');
export const setSoundEnabled = (val: boolean) =>
  set('options', {...getOptions(), soundEnabled: val});
export const setMusicEnabled = (val: boolean) =>
  set('options', {...getOptions(), musicEnabled: val});
export const getMaps = (): BattleFieldMap => get('maps');
