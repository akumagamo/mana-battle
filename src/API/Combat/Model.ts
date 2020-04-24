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

export interface Combat {
  teamA: Team;
  teamB: Team;
  totalUnits: number;
}
