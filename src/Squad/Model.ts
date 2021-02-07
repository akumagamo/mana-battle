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

// TODO: add new fn for units coming from outside the board
export const changeSquadMemberPosition = (
  unit: SquadMember,
  squad: Squad,
  x: number,
  y: number,
  onSquadUpdated: (squad: Squad) => void
) => {
  console.log("change position", unit, squad, x, y);
  const { members } = squad;

  const updatedBoard = placeUnitInBoard(x, y, unit, members);

  console.log(`updated board`, updatedBoard);

  const updatedSquad = { ...squad, members: updatedBoard.members };

  console.log(`will save updatedSquad`, updatedSquad);
  // TODO: remove this callback
  onSquadUpdated(updatedSquad);

  console.log(`will return`, updatedBoard);

  return updatedBoard;
};

function placeUnitInBoard(
  x: number,
  y: number,
  unit: SquadMember,
  members: SquadMemberMap
) {
  const newEntry: SquadMember = {
    leader: unit.leader,
    x,
    y,
    id: unit.id,
  };

  const unitInTargetPosition = Object.values(members).find(
    (member) => member.x === x && member.y === y
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
        { id: unit.id, x, y },
        { id: unitInTargetPosition.id, x: unit.x, y: unit.y },
      ],
    };
  } else {
    return {
      members: { ...members, [unit.id]: newEntry },
      updatedUnits: [{ id: unit.id, x, y }],
    };
  }
}
