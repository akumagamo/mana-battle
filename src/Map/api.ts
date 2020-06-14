// @ts-nocheck

import {Vector} from './MapScene';
import * as PF from 'pathfinding';
import {INVALID_STATE} from '../errors';
import * as R from 'ramda';
import * as S from 'sanctuary';

type UnitId = string;
type ForceId = string;

type MapUnit = {
  id: UnitId;
  pos: Vector;
  range: number;
  force: ForceId;
  validSteps: Vector[];
};
type MapForce = {
  id: ForceId;
  units: UnitId[];
};
type TurnManager = {
  forces: MapForce[];
  units: MapUnit[];
  currentForce: ForceId;
  grid: number[][];
  width: number;
  height: number;
  walkableCells: number[];
};

const makeVector = (x: number) => (y: number) => ({x, y});
export const getPossibleMoves = ({
  units,
  forces,
  currentForce,
  grid,
  walkableCells,
  width,
  height,
}: TurnManager) => {
  const force = S.find((f) => f.id === currentForce)(forces);

  const getUnit = (unitId: UnitId) => {
    const unit = units.find((u) => u.id === unitId);

    if (!unit) throw new Error(INVALID_STATE);
    return unit;
  };

  const getUnits = (list: UnitId[]) => R.map(getUnit, list);

  const enemyVectors = S.pipe([
    S.map((f) => f.units),
    S.map(getUnits),
    S.map(S.map(S.prop('pos'))),
  ])(S.find((f) => f.id !== currentForce)(forces));

  const isEnemyHere = ({x, y}) =>
    S.map(S.any((vec) => vec.x === x && vec.y === y))(enemyVectors);

  const updatedGrid = grid.map((row, y) =>
    row.map((cell, x) =>
      S.equals(isEnemyHere({x, y}))(S.Just(true)) ? 1 : cell,
    ),
  );
  const pfGrid = new PF.Grid(updatedGrid);
  const finder = new PF.AStarFinder();

  const getUnitValidSteps = ({pos: {x, y}, range}: MapUnit) => {
    const xs = R.range(x - range, x + range + 1);
    const ys = R.range(y - range, y + range + 1);

    const getVectors: (xs: number[]) => (ys: number[]) => Vector[] = S.lift2(
      makeVector,
    );

    const isValid = (vec: Vector) =>
      vec.x >= 0 && vec.x < width && vec.y >= 0 && vec.y < height;

    const isInRange = (vec: Vector) =>
      Math.abs(vec.x - x) + Math.abs(vec.y - y) <= range;

    const isWalkable = ({x, y}: Vector) => walkableCells.includes(grid[y][x]);

    const vecFromTuple = ([x, y]: number[]) => ({x, y});

    return R.pipe(
      () => getVectors(xs)(ys),
      S.filter(isValid),
      S.filter(isInRange),
      S.filter(isWalkable),
      S.map((vec) => finder.findPath(x, y, vec.x, vec.y, pfGrid.clone())),
      S.filter((list) => list.length <= range + 1),
      R.chain(R.map(vecFromTuple)),
      R.uniq,
      S.reject((vec) => S.equals(isEnemyHere(vec))(S.Just(true))),
      S.reject(S.equals({x, y})),
    )();
  };

  return R.pipe(
    R.map(S.prop('units')),
    R.chain(getUnits),
    S.map((unit) => ({
      ...unit,
      validSteps: getUnitValidSteps(unit),
    })),
  )(force);
};
