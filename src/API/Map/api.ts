import * as PF from 'pathfinding';
import S from 'sanctuary';
import {Vector, TurnManager, MapSquad, Step} from './Model';
import {MapState} from './Model';
import {Map, Range} from 'immutable';

const getBy = (attr: string) => <A>(target: A) =>
  S.find((el: any) => S.equals(S.prop(attr)(el))(target));

const byId = getBy('id');

export const findById = <A>(list: A[]) => (id: string) => getBy('id')(id)(list);

const uniq = S.reduce((ns: any[]) => (n: any) =>
  S.elem(n)(ns) ? ns : ns.concat([n]),
)([]);

const makeVector = (x: number) => (y: number) => ({x, y});

export const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

export const unitsFromForce = (state: MapState) => (id: string) =>
  S.filter((u: MapSquad) => u.force === id)(state.squads);

export const getUnit = (state: MapState) => (id: string) =>
  findById(state.squads)(id);

export const getForce = (state: MapState) => (id: string) =>
  findById(state.forces)(id);

export const getEntities = <A>(entityList: A[]) => (idList: string) =>
  S.pipe([S.map((id: string) => findById(entityList)(id)), S.justs])(idList);

export const getMovesForUnit = (state: MapState) => (id: string) => {
  //resume-todo: victory screen: just like wc3!
};

export const getPossibleMoves = ({
  units,
  forces,
  currentForce,
  grid,
  walkableCells,
}: TurnManager) => {
  const width = grid[0].length;
  const height = grid.length;

  /**   force :: Maybe Force */
  const force = byId(currentForce)(forces);

  const enemyUnits = S.filter((u: MapSquad) => u.force !== currentForce)(units);

  const getUnits = S.pipe([S.map((unitId) => byId(unitId)(units)), S.justs]);

  /**   getVectors :: MapUnit -> Vector */
  const getVectors = S.prop('pos'); // Vector

  const enemyVectors = S.map(getVectors)(enemyUnits);

  const enemyIndex = indexVectors(enemyVectors);

  // Marks enemy-occupied cells as "walls"
  // @ts-ignore
  const updatedGrid: number[][] = blockVectorsInGrid(grid)(enemyIndex);

  const getUnitValidSteps = ({pos: {x, y}, range}: MapSquad): Step[] => {
    const xs = Range(x - range - 1, x + range + 1)
      .filter((n) => n >= 0 && n < width)
      .toList();
    const ys = Range(y - range - 1, y + range + 1)
      .filter((n) => n >= 0 && n < height)
      .toList();

    const isInRange = (range: number) => (vec: Vector) =>
      getDistance({x, y})(vec) <= range;

    const isWalkable = ({x, y}: Vector) => walkableCells.includes(grid[y][x]);

    const pathFinder = getPathTo(updatedGrid)({x, y});

    const pathInRange = <T>(list: T[]) => list.length <= range + 1;

    //@ts-ignore
    return ys
      .map((y_) => xs.map((x_) => ({x: x_, y: y_})))
      .flatten(1)
      .filter(isInRange(range))
      .filter(isWalkable)
      .map(pathFinder)
      .filter((p) => p.length > 1)
      .filter(pathInRange)
      .map((l) => l.map(([x, y]) => ({x, y})))
      .map((steps: Vector[]) => ({
        target: steps[steps.length - 1],
        steps,
      }))
      .toJS();
  };

  // TODO: it makes no sense to return a maybe because the force should be a parameter
  return S.map(
    S.pipe([
      S.prop('squads'),
      getUnits,
      S.map((unit: MapSquad) => {
        const steps = getUnitValidSteps(unit);

        const targets = S.map((step: Step) => step.target)(steps);

        return {
          ...unit,
          validSteps: steps,
          enemiesInRange: S.pipe([
            S.filter((u: MapSquad) => unit.force !== u.force),
            S.filter((enemy: MapSquad) =>
              S.any(
                (step: Vector) =>
                  getDistance(step)(enemy.pos) === 1 &&
                  getPathTo(grid)(unit.pos)(enemy.pos).length <= unit.range,
              )(targets),
            ),
            S.map((enemy: MapSquad) => ({
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

export const blockVectorsInGrid = (grid: number[][]) => (
  blockIndex: Map<string, Map<string, boolean>>,
) => grid.map((ys, y) =>
    ys.map((cell, x) => {
      if (blockIndex.getIn([y, x], false)) return 1;
      else return cell;
    }),
  );

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
