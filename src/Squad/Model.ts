export type SquadMember = {
  id: string;
  x: number;
  y: number;
  leader: boolean;
};

export type SquadMemberMap = {
  [id: string]: SquadMember;
};

export type ForceId = string

export type Squad = {
  id: string;
  name: string;
  emblem: string;
  members: SquadMemberMap;
  force: ForceId;
};

export type SquadMap = {
  [id: string]: Squad;
};
