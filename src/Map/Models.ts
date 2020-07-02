export type Vector = {x: number; y: number};

export type UnitId = string;
export type ForceId = string;

export type MapUnit = {
  id: UnitId;
  pos: Vector;
  range: number;
  force: ForceId;
  validSteps: Vector[];
  enemiesInRange: MapUnit[];
};
export type MapForce = {
  id: ForceId;
  units: UnitId[];
};
export type TurnManager = {
  forces: MapForce[];
  units: MapUnit[];
  currentForce: ForceId;
  grid: number[][];
  width: number;
  height: number;
  walkableCells: number[];
};
