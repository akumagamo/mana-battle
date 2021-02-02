export type SquadMember = {
  id: string;
  x: number;
  y: number;
  leader: boolean;
};

export type SquadMemberMap = {
  [id: string]: SquadMember;
};

export type ForceId = string;

export type Squad = {
  id: string;
  name: string;
  members: SquadMemberMap;
  force: ForceId;
};

export type SquadMap = {
  [id: string]: Squad;
};

export const makeSquad = (id: string, force: string) => ({
  id,
  name: "",
  members: {},
  force,
});

export const updateMember = (squad: Squad, member: SquadMember): Squad => ({
  ...squad,
  members: Object.entries({ ...squad.members, [member.id]: member }).reduce(
    (xs, [k, v]) => ({
      ...xs,
      [k]: { ...v, leader: k === member.id ? member.leader : !member.leader },
    }),
    {}
  ),
});
