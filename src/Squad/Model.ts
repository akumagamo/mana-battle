import { List, Map, Record, RecordOf, Set } from "immutable";
import { Unit } from "../Unit/Model";

export type ForceId = string;

export type Squad = RecordOf<{
  id: string;
  members: MemberIndex;
  force: ForceId;
  leader: string;
}>;

export type Member = RecordOf<{
  id: string;
  x: number;
  y: number;
}>;

export type MemberIndex = Map<string, Member>;

export type Index = Map<string, Squad>;

export const makeSquad = Record(
  {
    id: "",
    members: Map<string, Member>(),
    force: "",
    leader: "",
  },
  "Squad"
);

export const makeSquadMember = Record(
  {
    id: "",
    x: 1,
    y: 1,
  },
  "SquadMember"
);

export const isLeader = (squad: Squad, id: string) => squad.leader === id;
export const changeLeader = (id: string, squad: Squad) =>
  squad.set("leader", id);

export const mapSquadMembers = (fn: (s: Member) => Member) => (index: Index) =>
  index.map((squad) => squad.set("members", squad.members.map(fn)));

export const filterMembersFromSquad = (fn: (s: Member) => boolean) => (
  squad: Squad
) => squad.set("members", squad.members.filter(fn));

export const filterMembers = (fn: (s: Member) => boolean) => (index: Index) =>
  index.map(filterMembersFromSquad(fn));

export const mapMembers = (fn: (s: Member) => Member) => (squadId: string) => (
  index: Index
) =>
  index.map((squad) =>
    squad.id === squadId ? squad.set("members", squad.members.map(fn)) : squad
  );

/** Returns a List with the squad members from all indexed squads */
export const getAllUnits = (index: Index): List<Member> =>
  index.reduce(
    (xs, x) => xs.concat(x.members.toList()),
    List() as List<Member>
  );

export const getMember = (unitId: string, squad: Squad) =>
  squad.members.get(unitId);

export const getLeader = (squad: Squad) => squad.members.get(squad.leader);

export const findMember = (fn: (m: Member) => boolean, squad: Squad) =>
  squad.members.find(fn);

/**
 * Adds a new member or updates an existing one.
 */
export const updateMember = (squad: Squad, member: Member): Squad =>
  squad.set("members", squad.members.set(member.id, member));

export const removeMember = (id: string, squad: Squad): Squad =>
  squad.set("members", squad.members.delete(id));

export const changeSquadMemberPosition = (
  unit: Member,
  squad: Squad,
  x: number,
  y: number
) => updateMember(squad, unit.merge({ x, y }));

export const getMemberByPosition = ({ x, y }: { x: number; y: number }) => (
  sqd: Squad
) => sqd.members.find((m) => m.x === x && m.y === y);

export const addMember = (unit: Unit, squad: Squad, x: number, y: number) => {
  const newMember = makeSquadMember({ id: unit.id, x, y });
  const memberToRemove = getMemberByPosition({ x, y })(squad);

  if (memberToRemove) {
    const updatedSquad = filterMembersFromSquad(
      (m) => m.id !== memberToRemove.id
    )(squad);

    return {
      updatedSquad,
      added: [newMember],
      removed: [memberToRemove],
    };
  } else {
    const updatedSquad = updateMember(squad, newMember);

    return { updatedSquad, added: [newMember], removed: [] };
  }
};
export const invertBoardPosition = (n: number) => {
  // TOOD: use a range, like this
  // const positions = [1,2,3]
  // return positions.reverse()[n+1]

  if (n === 1) return 3;
  else if (n === 3) return 1;
  else return n;
};
export function transpose(member: Member) {
  const { x, y } = member;
  return {
    ...member,
    x: invertBoardPosition(x) + 3,
    y: invertBoardPosition(y),
  };
}
