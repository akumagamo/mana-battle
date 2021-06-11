import { List, Map, Record, RecordOf } from "immutable";
import { Unit } from "../Unit/Model";

export type ForceId = string;

export type Model = {
  id: string;
  members: MemberIndex;
  force: ForceId;
  leader: string;
};
export type SquadRecord = RecordOf<Model>;

export type Member = {
  id: string;
  x: number;
  y: number;
};
export type MemberRecord = RecordOf<Member>;

export type MemberIndex = Map<string, MemberRecord>;

export type Index = Map<string, SquadRecord>;

export const createSquad = Record(
  {
    id: "",
    members: Map<string, MemberRecord>(),
    force: "",
    leader: "",
  },
  "Squad"
);

export const squadBuilder = ({
  id,
  force,
  leader,
  members,
}: {
  id: string;
  force: string;
  leader: string;
  members: [string, number, number][];
}) =>
  createSquad({
    id,
    members: members.reduce(
      (xs, [id, x, y]) => xs.set(id, makeMember({ id, x, y })),
      Map() as MemberIndex
    ),
    force,
    leader,
  });

export const makeMember = Record(
  {
    id: "",
    x: 1,
    y: 1,
  },
  "SquadMember"
);

export const isLeader = (squad: SquadRecord, id: string) => squad.leader === id;
export const changeLeader = (id: string, squad: SquadRecord) =>
  squad.set("leader", id);

export const mapSquadMembers = (fn: (s: MemberRecord) => MemberRecord) => (
  index: Index
) => index.map((squad) => squad.set("members", squad.members.map(fn)));

export const filterMembersFromSquad = (fn: (s: MemberRecord) => boolean) => (
  squad: SquadRecord
) => squad.set("members", squad.members.filter(fn));

export const filterMembers = (fn: (s: MemberRecord) => boolean) => (
  index: Index
) => index.map(filterMembersFromSquad(fn));

export const mapMembers = (fn: (s: MemberRecord) => MemberRecord) => (
  squadId: string
) => (index: Index) =>
  index.map((squad) =>
    squad.id === squadId ? squad.set("members", squad.members.map(fn)) : squad
  );

/** Returns a List with the squad members from all indexed squads */
export const getAllUnits = (index: Index): List<MemberRecord> =>
  index.reduce(
    (xs, x) => xs.concat(x.members.toList()),
    List() as List<MemberRecord>
  );

export const getUnitsFromSquad = (id: string) => (
  index: Index
): List<MemberRecord> => getAllUnits(index.filter((s) => s.id === id));

export const rejectUnitsFromSquad = (id: string) => (
  index: Index
): List<MemberRecord> => getAllUnits(index.filter((s) => s.id !== id));

export const getMember = (unitId: string, squad: SquadRecord) =>
  squad.members.get(unitId);

export const getLeader = (squad: SquadRecord) =>
  squad.members.get(squad.leader);

export const findMember = (
  fn: (m: MemberRecord) => boolean,
  squad: SquadRecord
) => squad.members.find(fn);

/**
 * Adds a new member or updates an existing one.
 */
export const updateMember = (
  squad: SquadRecord,
  member: MemberRecord
): SquadRecord =>
  squad
    .set("members", squad.members.set(member.id, member))
    .set("leader", squad.leader === "" ? member.id : squad.leader);

export const removeMember = (id: string, squad: SquadRecord): SquadRecord =>
  squad.set("members", squad.members.delete(id));

export const changeSquadMemberPosition = (
  unit: MemberRecord,
  squad: SquadRecord,
  x: number,
  y: number
) => updateMember(squad, unit.merge({ x, y }));

export const getMemberByPosition = ({ x, y }: { x: number; y: number }) => (
  sqd: SquadRecord
) => sqd.members.find((m) => m.x === x && m.y === y);

export const addMember = (
  unit: Unit,
  squad: SquadRecord,
  x: number,
  y: number
) => {
  const newMember = makeMember({ id: unit.id, x, y });
  const memberToRemove = getMemberByPosition({ x, y })(squad);

  if (memberToRemove) {
    const updatedSquad = filterMembersFromSquad(
      (m) => m.id !== memberToRemove.id
    )(squad);

    return {
      updatedSquad,
      added: [newMember.id],
      removed: [memberToRemove.id],
    };
  } else {
    const updatedSquad = updateMember(squad, newMember);

    return { updatedSquad, added: [newMember.id], removed: [] as string[] };
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

/**
 * Mirrors a squad member position
 *
 * x x 1      x x 3
 * x x 2  =>  2 x x
 * 3 x x      1 x x
 *
 * Used to enable targeting when two squads are facing each other
 *
 */
export function transpose(member: MemberRecord): MemberRecord {
  const { x, y } = member;
  return member.merge(
    Map({
      x: invertBoardPosition(x) + 3,
      y: invertBoardPosition(y),
    })
  );
}
