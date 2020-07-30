import * as PF from 'pathfinding';
import S from 'sanctuary';
import {Vector, TurnManager, MapUnit, Step} from './Model';
import {MapState} from './Model';
import {Map} from 'immutable';

const getBy = (attr: string) => <A>(target: A) =>
  S.find((el: any) => S.equals(S.prop(attr)(el))(target));

const byId = getBy('id');

export const findById = <A>(list: A[]) => (id: string) => getBy('id')(id)(list);

const uniq = S.reduce((ns: any[]) => (n: any) =>
  S.elem(n)(ns) ? ns : ns.concat([n]),
)([]);

const makeVector = (x: number) => (y: number) => ({x, y});

const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

export const unitsFromForce = (state: MapState) => (id: string) =>
  S.filter((u: MapUnit) => u.force === id)(state.units);

export const getUnit = (state: MapState) => (id: string) =>
  findById(state.units)(id);

export const getForce = (state: MapState) => (id: string) =>
  findById(state.forces)(id);

export const getEntities = <A>(entityList: A[]) => (idList: string) =>
  S.pipe([S.map((id: string) => findById(entityList)(id)), S.justs])(idList);

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

  const enemyUnits = S.filter((u: MapUnit) => u.force !== currentForce)(units);

  const getUnits = S.pipe([S.map((unitId) => byId(unitId)(units)), S.justs]);

  /**   getVectors :: MapUnit -> Vector */
  const getVectors = S.prop('pos'); // Vector

  const enemyVectors = S.map(getVectors)(enemyUnits);

  const enemyIndex = indexVectors(enemyVectors);

  const isEnemyHere = (vec: Vector) => enemyIndex.getIn([vec.y, vec.x], false);

  // Marks enemy-occupied cells as "walls"
  // @ts-ignore
  const updatedGrid: number[][] = blockVectorsInGrid(grid)(enemyIndex);

  const getUnitValidSteps = ({pos: {x, y}, range}: MapUnit): Step[] => {
    console.time(`getUnitValidSteps`);
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

    const res = S.pipe([
      ({xs, ys}) => S.lift2(makeVector)(xs)(ys),
      S.filter(isInBoard),
      S.filter(isInRange(range)),
      S.filter(isWalkable),
      S.map(pathFinder),
      S.filter(pathInRange),
      S.chain(S.map(vecFromTuple)),
      uniq,
      S.reject(isEnemyHere),
      S.reject(S.equals({x, y})),
      S.map((vec: Vector) => ({
        target: vec,
        steps: S.map(([x, y]: number[]) => makeVector(x)(y))(
          getPathTo(updatedGrid)({x, y})(vec),
        ),
      })),
    ])({xs, ys});

    console.timeEnd(`getUnitValidSteps`);
    return res;
  };

  // TODO: it makes no sense to return a maybe because the force should be a parameter
  return S.map(
    S.pipe([
      S.prop('units'),
      getUnits,
      S.map((unit: MapUnit) => {
        const steps = getUnitValidSteps(unit);

        const targets = S.map((step: Step) => step.target)(steps);

        return {
          ...unit,
          validSteps: steps,
          enemiesInRange: S.pipe([
            S.filter((u: MapUnit) => unit.force !== u.force),
            S.filter((enemy: MapUnit) =>
              S.any(
                (step: Vector) =>
                  getDistance(step)(enemy.pos) === 1 &&
                  getPathTo(grid)(unit.pos)(enemy.pos).length <= unit.range,
              )(targets),
            ),
            S.map((enemy: MapUnit) => ({
              enemy: enemy.id,
              steps: getPathTo(grid)(unit.pos)(enemy.pos)
                .slice(0, -1)
                .map(([x, y]) => makeVector(x)(y)),
            })),
          ])(units),
        };
      }),
    ]),
  )(force);
};

// TODO: creating an indexed list of lists
// By knowing the width and height of the grid
// Zip the first level with a range (max is height)
// For each elem, zip with another range (max is width)
export const blockVectorsInGrid = (grid: number[][]) => (
  blockIndex: Map<string, Map<string, boolean>>,
) => {
  console.time(`blockVectorsInGrid `);

  const res = grid.map((ys, y) =>
    ys.map((cell, x) => {
      if (blockIndex.getIn([y, x], false)) return 1;
      else return cell;
    }),
  );

  console.timeEnd(`blockVectorsInGrid `);

  return res;
};

export const getPathTo = (grid: number[][]) => (source: Vector) => (
  target: Vector,
) => {
  const pfGrid = new PF.Grid(grid);
  const finder = new PF.AStarFinder();

  const res = finder.findPath(source.x, source.y, target.x, target.y, pfGrid);

  return res;
};

const indexVectors = (vectors: Vector[]) =>
  vectors.reduce((map, vec) => map.setIn([vec.y, vec.x], true), Map());
