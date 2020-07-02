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

const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

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
  const updatedGrid: number[][] = blockVectorsInGrid(grid)(
    // @ts-ignore
    S.fromMaybe([])(enemyVectors),
  );

  const getUnitValidSteps = ({pos: {x, y}, range}: MapUnit) => {
    const xs = S.range(x - range)(x + range + 1);
    const ys = S.range(y - range)(y + range + 1);

    const isInBoard = (vec: Vector) =>
      vec.x >= 0 && vec.x < width && vec.y >= 0 && vec.y < height;

    const isInRange = (range: number) => (vec: Vector) =>
      getDistance({x, y})(vec) <= range;

    const isWalkable = ({x, y}: Vector) => walkableCells.includes(grid[y][x]);

    const vecFromTuple = ([x, y]: number[]) => ({x, y});

    const pathFinder = getPathTo(updatedGrid)({x, y});

    const pathInRange = (list: Vector[]) => list.length <= range + 1;

    const isEnemyInVector = (vec: Vector) =>
      equals(isEnemyHere(vec))(S.Just(true));

    return pipe([
      ({xs, ys}) => lift2(makeVector)(xs)(ys),
      filter(isInBoard),
      filter(isInRange(range)),
      filter(isWalkable),
      map(pathFinder),
      filter(pathInRange),
      chain(map(vecFromTuple)),
      uniq,
      reject(isEnemyInVector),
      reject(equals({x, y})),
    ])({xs, ys});
  };

  // TODO: it makes no sense to return a maybe because the force should be a parameter
  return map(
    pipe([
      prop('units'),
      getUnits,
      map((unit: MapUnit) => {
        const steps = getUnitValidSteps(unit);

        return {
          ...unit,
          validSteps: steps,
          enemiesInRange: pipe([
            filter((u: MapUnit) => unit.force !== u.force),
            filter((enemy: MapUnit) =>
              S.any(
                (step: Vector) =>
                  getDistance(step)(enemy.pos) === 1 &&
                  getPathTo(grid)(unit.pos)(enemy.pos).length <= unit.range,
              )(steps),
            ),
          ])(units),
        };
      }),
    ]),
  )(force);
};

export const blockVectorsInGrid = (grid: number[][]) => (vectors: Vector[]) => {
  const zipMe = (list: any[]) =>
    S.pipe([prop('length'), S.range(0), S.zip(list)])(list);

  const ypairs = zipMe(grid);

  return map((pair: any) => {
    const xs: number[] = S.fst(pair);
    const y = S.snd(pair);

    const xpairs = zipMe(xs);

    return map((xpair: any) => {
      const cell = S.fst(xpair);
      const x = S.snd(xpair);

      return S.elem({x, y})(vectors) ? 1 : cell;
    })(xpairs);
  })(ypairs);
};

export const getPathTo = (grid: number[][]) => (source: Vector) => (
  target: Vector,
) => {
  const pfGrid = new PF.Grid(grid);
  const finder = new PF.AStarFinder();

  return finder.findPath(source.x, source.y, target.x, target.y, pfGrid);
};
