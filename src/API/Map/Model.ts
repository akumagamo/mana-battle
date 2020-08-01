export type UnitId = string;
export type ForceId = string;
export type CityId = string;

export type CellNumber = 0 | 1 | 2;
export type MapState = {
  cells: CellNumber[][];
  forces: Force[];
  cities: City[];
  units: MapUnit[];
};
export type Force = {
  id: ForceId;
  name: string;
  units: string[];
  relations: {[id: string]: 'hostile' | 'neutral' | 'ally'};
};

export type City = {
  id: CityId;
  name: string;
  x: number;
  y: number;
  force: ForceId | null;
  type: "town" | "castle" | "shop"
};

export type Vector = {x: number; y: number};
export type ValidStep = {target: Vector, steps: Vector[]}
export type EnemyInRange = {enemy: string, steps: Vector[]}
export type MapUnit = {
  id: UnitId;
  pos: Vector;
  range: number;
  force: ForceId;
  validSteps: ValidStep[];
  enemiesInRange: EnemyInRange[];
  status: "alive" | "defeated";
};

export type TurnManager = {
  forces: Force[];
  units: MapUnit[];
  currentForce: ForceId;
  grid: number[][];
  walkableCells: number[];
};

export type Step = {target:Vector, steps:Vector[]}
