import {
  SquadRecord,
  MemberRecord,
  MemberIndex,
  Index,
  makeMember,
  makeSquad,
} from "./Squad/Model";
import { Item, itemTypeSlots, ItemTypeSlots, ItemMap } from "./Item/Model";
import { Unit, UnitIndex } from "./Unit/Model";
import { Options } from "./Models";
import { BattleFieldMap } from "./Map/Model";
import { getUnitAttacks } from "./Unit/Skills";
import { PLAYER_FORCE } from "./constants";
import { List, Map } from "immutable";

const get = (str: string) => JSON.parse(localStorage.getItem(str) || "{}");
const set = (str: string, data: any) =>
  localStorage.setItem(str, JSON.stringify(data));

export const getSquadsFromDB = (): Index => get("squads");

export const getSquadFromDB = (id: string): SquadRecord => {
  return getSquadsFromDB().get(id);
};

export const getSquadMembersFromDB = (id: string): List<Unit> => {
  const squad = getSquadFromDB(id);

  return squad.members
    .map((unit) => getUnitFromDB(unit.id))
    .filter((a) => a)
    .toList();
};

export const getSquadMemberFromDB = (id: string): MemberRecord => {
  const unit = getUnitFromDB(id);
  const squad = getSquadFromDB(unit.squad);

  return squad.members.get(id);
};

export const getSquadLeaderFromDB = (id: string): Unit => {
  const squad = getSquadFromDB(id);

  const unit = getUnitFromDB(squad.leader);

  return unit;
};

export const getUnitsFromDB = (): UnitIndex => {
  let units = get("units") as UnitIndex;

  return units.map((u) => ({ ...u, attacks: getUnitAttacks(u.class) }));
};

export const getItemsFromDB = (): ItemMap => get("items");
export const getItemFromDB = (id: string): Item => {
  return getItemsFromDB()[id];
};
export const getItemList = (): Item[] => Object.values(getItemsFromDB());

export const getItemTypes = (): ItemTypeSlots => itemTypeSlots;

export const getUnitFromDB = (id: string): Unit => {
  const unit = getUnitsFromDB().get(id);

  return { ...unit, attacks: getUnitAttacks(unit.class) };
};

export const saveSquadsIntoDB = (squads: Index) => set("squads", squads);

export const saveUnitsIntoDB = (units: UnitIndex) => {
  const unitsToSave = units.map((u) => {
    delete u.attacks;
    return u;
  });

  set("units", unitsToSave.toJS());
};

export const saveItemsIntoDB = (items: ItemMap) => set("items", items);

export const saveSquadIntoDB = (squad: SquadRecord) => {
  const squads = getSquadsFromDB();
  saveSquadsIntoDB({ ...squads, [squad.id]: squad });
};

// Unit queries

export const saveUnitIntoDB = (unit: Unit) => {
  const units = getUnitsFromDB();
  saveUnitsIntoDB({ ...units, [unit.id]: unit });
};

/** Persists unit representation in squad map */
export const saveSquadUnitIntoDB = ({
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
  const squads = getSquadsFromDB();
  const squad = squads.get(squadId);
  saveSquadsIntoDB({
    ...squads,
    [squadId]: {
      ...squad,
      members: {
        ...squad.members,
        [unitId]: {
          id: unitId,
          x,
          y,
        },
      },
    },
  });
};

export const disbandSquad = (id: string) => {
  const squads = getSquadsFromDB();

  const squadToRemove = squads.get(id);

  squadToRemove.members.forEach((member) =>
    removeUnitFromSquad(member.id, squadToRemove)
  );

  saveSquadsIntoDB(squads.delete(id));
};

export const removeUnitFromSquad = (unitId: string, squad: SquadRecord) => {
  const unit = getUnitFromDB(unitId);
  const updatedUnit = { ...unit, squad: null } as Unit;

  const { members } = squad;

  const updatedMembers: MemberIndex = members.delete(unitId);

  const updatedSquad = { ...squad, members: updatedMembers };

  saveUnitIntoDB(updatedUnit);
  saveSquadIntoDB(updatedSquad);
};

export const createSquad = (leader: Unit) => {
  const squads = getSquadsFromDB();
  const newId = squads.size.toString();

  let defaultX = 2;
  let defaultY = 2;

  const newSquad = makeSquad({
    id: newId,
    force: PLAYER_FORCE,
    leader: leader.id,
    members: Map({
      [leader.id]: makeMember({ id: leader.id, x: defaultX, y: defaultY }),
    }),
  });
  const updatedSquads = squads.set(newId, newSquad);

  const updatedUnit: Unit = {
    ...leader,
    squad: newId,
  };
  const fn = (
    resolve: ({ units, squads }: { units: UnitIndex; squads: Index }) => void
  ) => {
    saveSquadsIntoDB(updatedSquads);
    saveUnitIntoDB(updatedUnit);
    const units = getUnitsFromDB();
    console.log(units, updatedSquads);
    resolve({ units, squads: updatedSquads });
  };

  return new Promise(fn);
};

export const equipItem = (itemId: string, unitId: string) => {
  const unit = getUnitFromDB(unitId);
  const item = getItemFromDB(itemId);

  if (!unit) throw new Error("An invalid unit id was supplied to equipItem");
  if (!item) throw new Error("An invalid item id was supplied to equipItem");

  const slot = getItemTypes()[item.type];

  const updatedUnit = { ...unit, equips: { ...unit.equips, [slot]: item.id } };

  saveUnitIntoDB(updatedUnit);
};

export const getOptions = (): Options => get("options");
export const setSoundEnabled = (val: boolean) =>
  set("options", { ...getOptions(), soundEnabled: val });
export const setMusicEnabled = (val: boolean) =>
  set("options", { ...getOptions(), musicEnabled: val });
export const getMaps = (): BattleFieldMap => get("maps");
