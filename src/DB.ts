import {Squad, SquadMember, SquadMemberMap, SquadMap} from './Squad/Model';
import {unitsWithoutSquadSelector} from './Unit/selectors';
import {Item, itemTypeSlots, ItemTypeSlots, ItemMap} from './Item/Model';
import {Unit, UnitMap} from './Unit/Model';
import {removeIdFromMap} from './utils';

const get = (str: string) => JSON.parse(localStorage.getItem(str) || '{}');
const set = (str: string, data: any) =>
  localStorage.setItem(str, JSON.stringify(data));

export const getSquads = (): SquadMap => get('squads');

export const getUnits = (): UnitMap => get('units');

export const getItems = (): ItemMap => get('items');

export const getItemTypes = (): ItemTypeSlots => itemTypeSlots;

export const getUnit = (id: string): Unit | undefined => getUnits()[id];

export const saveSquads = (squads: SquadMap) => set('squads', squads);

export const saveUnits = (units: UnitMap) => set('units', units);

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

export const unitsWithoutSquad = () => unitsWithoutSquadSelector(getUnits());

// TODO: remove unit in target tile
export const addUnitToSquad = (
  unit: Unit,
  squad: Squad,
  x: number,
  y: number,
) => {

  const {members} = squad;

  const newEntry = {
    leader: false,
    x,
    y,
    id: unit.id,
  };

  const unitInTargetPosition = Object.values(members).find(
    (member) => member.x === x && member.y === y,
  );

  if (unitInTargetPosition) {

    console.log(`REMOVE EXISTING`)

    const remainingMembers = Object.values(members).filter(member=>member.id !== unitInTargetPosition.id);
    const updatedMembers = remainingMembers.concat([newEntry]).reduce((acc,curr)=>({...acc, [curr.id]:curr}),{})

    const updatedSquad = {...squad, members: updatedMembers as SquadMemberMap};

    const removedUnit = getUnit(unitInTargetPosition.id) 

    if(!removedUnit)throw new Error('Invalid state')

    saveUnit({...removedUnit, squad:null})
    saveUnit({...unit, squad: squad.id});
    saveSquad(updatedSquad);

    return updatedSquad;


  } else {
    const updatedMembers = {...members, [unit.id]: newEntry};

    const updatedSquad = {...squad, members: updatedMembers};

    saveUnit({...unit, squad: squad.id});
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
  const updatedUnit = {...unit, squad: null};

  const {members} = squad;

  const updatedMembers: SquadMemberMap = removeIdFromMap(unitId, members);

  const updatedSquad = {...squad, members: updatedMembers};

  saveUnit(updatedUnit);
  saveSquad(updatedSquad);
};

export const createSquad = (leader: Unit) => {
  const squads = getSquads();
  const newId = squads.length.toString();

  const newSquad = {
    id: newId,
    name: leader.name,
    emblem: 'Emoji',
    members: {
      [leader.id]: {id: leader.id, leader: true, x: 2, y: 2},
    },
  };
  const updatedSquads = {
    ...squads,
    [newId]: newSquad,
  };

  const updatedUnit = {...leader, squad: newId};
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

export const equipItem = (item: Item, unitId: string) => {
  const unit = getUnit(unitId);

  if (!unit) throw new Error('An invalid unit id was supplied to equipItem');

  const slot = getItemTypes()[item.type];

  const updatedUnit = {...unit, equips: {...unit.equips, [slot]: item.id}};

  saveUnit(updatedUnit);
};
