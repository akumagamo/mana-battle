export interface Team {
  grid: {
    [x: number]: {[y: number]: string};
  };
  members: {
    [id: string]: TeamMember;
  };
}
export interface TeamMember {
  hp: number;
  initiative: number;
  x: number;
  y: number;
}

export interface InitiativeList {
  [order:number]:string
}
export interface Combat {
  teamA: Team;
  teamB: Team;
  initiativeList: InitiativeList
  totalUnits: number;
}
