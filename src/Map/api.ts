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

  const getUnit = (unitId: UnitId) => S.find((u) => u.id === unitId)(units);

  const getUnits = S.pipe([S.map(getUnit), S.justs]);

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
    const xs = S.range(x - range)(x + range + 1);
    const ys = S.range(y - range)(y + range + 1);

    const isValid = (vec: Vector) =>
      vec.x >= 0 && vec.x < width && vec.y >= 0 && vec.y < height;

    const isInRange = (vec: Vector) =>
      Math.abs(vec.x - x) + Math.abs(vec.y - y) <= range;

    const isWalkable = ({x, y}: Vector) => walkableCells.includes(grid[y][x]);

    const vecFromTuple = ([x, y]: number[]) => ({x, y});

    const uniq = S.reduce((ns) => (n) => (S.elem(n)(ns) ? ns : ns.concat([n])))(
      [],
    );

    return S.pipe([
      ({xs, ys}) => S.lift2(makeVector)(xs)(ys),
      S.filter(isValid),
      S.filter(isInRange),
      S.filter(isWalkable),
      S.map((vec) => finder.findPath(x, y, vec.x, vec.y, pfGrid.clone())),
      S.filter((list) => list.length <= range + 1),
      S.chain(S.map(vecFromTuple)),
      uniq,
      S.reject((vec) => S.equals(isEnemyHere(vec))(S.Just(true))),
      S.reject(S.equals({x, y})),
    ])({xs, ys});
  };

  const result = S.pipe([
    S.map(S.prop('units')),
    S.map(getUnits),
    S.map(
      S.map((unit) => ({
        ...unit,
        validSteps: getUnitValidSteps(unit),
      })),
    ),
  ])(force);

  return S.fromMaybe([])(result);
};
