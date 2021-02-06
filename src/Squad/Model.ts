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

/**
 * Adds a new member or updates an existing one.
 * If the new member is a leader, it will replace the existing one in the squad.
 */
export const updateMember = (squad: Squad, member: SquadMember): Squad => {
  const updatedMap = {
    ...squad.members,
    [member.id]: member,
  } as SquadMemberMap;

  if (member.leader)
    return {
      ...squad,
      members: Object.entries(updatedMap).reduce(
        (xs, [id, x]) => ({
          ...xs,
          [x.id]: { ...x, leader: member.id === id },
        }),
        {} as SquadMemberMap
      ),
    };
  else
    return {
      ...squad,
      members: updatedMap,
    };
};
