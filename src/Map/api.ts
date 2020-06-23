import * as PF from 'pathfinding';
import S, {
  lift2,
  prop,
  equals,
  pipe,
  chain,
  map,
  filter,
  reject,
  find,
} from 'sanctuary';
import {Vector, TurnManager, MapForce, MapUnit} from './Models';

const getBy = (attr: string) => (target: any) =>
  find((el: any) => equals(prop(attr)(el))(target));

const byId = getBy('id');

const uniq = S.reduce((ns: any[]) => (n: any) =>
  S.elem(n)(ns) ? ns : ns.concat([n]),
)([]);

const makeVector = (x: number) => (y: number) => ({x, y});

const map_ = pipe([map, map]);

export const getPossibleMoves = ({
  units,
  forces,
  currentForce,
  grid,
  walkableCells,
  width,
  height,
}: TurnManager) => {
  /**   force :: Maybe Force */
  const force = byId(currentForce)(forces);
  /**   enemyForce :: Maybe Force */
  const enemyForce = find((force: MapForce) => force.id !== currentForce)(
    forces,
  );

  const getUnits = pipe([map((unitId) => byId(unitId)(units)), S.justs]);

  /**   getVectors :: Force -> Array Vector */
  const getVectors = pipe([
    prop('units'), // Array UnitId
    getUnits, // Array Unit
    map(prop('pos')), // Array Vector
  ]);

  const enemyVectors = map(getVectors)(enemyForce);

  const isEnemyHere = (vec: Vector) => map(S.elem(vec))(enemyVectors);

  // Marks enemy-occupied cells as "walls"
  // @ts-ignore
  const updatedGrid = blockVectorsInGrid(grid)(S.fromMaybe([])(enemyVectors));

  const getUnitValidSteps = ({pos: {x, y}, range}: MapUnit) => {
    const xs = S.range(x - range)(x + range + 1);
    const ys = S.range(y - range)(y + range + 1);

    const isInBoard = (vec: Vector) =>
      vec.x >= 0 && vec.x < width && vec.y >= 0 && vec.y < height;

    const isInRange = (vec: Vector) =>
      Math.abs(vec.x - x) + Math.abs(vec.y - y) <= range;

    const isWalkable = ({x, y}: Vector) => walkableCells.includes(grid[y][x]);

    const vecFromTuple = ([x, y]: number[]) => ({x, y});

    const pathFinder = getPathTo(updatedGrid)({x, y});

    const pathInRange = (list: Vector[]) => list.length <= range + 1;

    const isEnemyInVector = (vec: Vector) =>
      equals(isEnemyHere(vec))(S.Just(true));

    return pipe([
      ({xs, ys}) => lift2(makeVector)(xs)(ys),
      filter(isInBoard),
      filter(isInRange),
      filter(isWalkable),
      map(pathFinder),
      filter(pathInRange),
      chain(map(vecFromTuple)),
      uniq,
      reject(isEnemyInVector),
      reject(equals({x, y})),
    ])({xs, ys});
  };

  const result = pipe([
    map(prop('units')),
    map(getUnits),
    map_((unit: MapUnit) => ({
      ...unit,
      validSteps: getUnitValidSteps(unit),
    })),
  ])(force);

  // @ts-ignore
  return S.fromMaybe([])(result);
};

export const blockVectorsInGrid = (grid: number[][]) => (vectors: Vector[]) => {
  return grid.map((row: number[], y: number) =>
    row.map((cell: number, x: number) => (S.elem({x, y})(vectors) ? 1 : cell)),
  );
};

export const getPathTo = (grid: number[][]) => (source: Vector) => (
  target: Vector,
) => {
  const pfGrid = new PF.Grid(grid);
  const finder = new PF.AStarFinder();

  return finder.findPath(source.x, source.y, target.x, target.y, pfGrid);
};
