import * as PF from 'pathfinding';
import {Vector, TurnManager, MapSquad, Step} from './Model';
import {MapState} from './Model';
import {Map, Range, List} from 'immutable';
import {INVALID_STATE} from '../../errors';

export type Identifiable = {id: string};

export const findById = (list: Identifiable[]) => (id: string) =>
  list.find((n) => n.id === id);

const makeVector = (x: number) => (y: number) => ({x, y});

export const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

export const squadsFromForce = (state: MapState) => (id: string) =>
  state.mapSquads.filter((u) => u.force === id);

export const getUnit = (state: MapState) => (id: string) =>
  findById(state.mapSquads)(id);

export const getForce = (state: MapState) => (id: string) =>
  findById(state.forces)(id);

export const getEntities = (entityList: Identifiable[]) => (idList: string[]) =>
  idList
    .map((id) => findById(entityList)(id))
    .reduce(
      (xs, x) => (typeof x !== 'undefined' ? xs.concat([x]) : xs),
      [] as Identifiable[],
    );

export const getMovesForUnit = (_: MapState) => (_: string) => {
  //resume-todo: victory screen: just like wc3!
};

export const getPossibleMoves = ({
  mapSquads,
  forces,
  currentForce,
  grid,
  walkableCells,
}: TurnManager) => {
  const width = grid[0].length;
  const height = grid.length;

  const force = forces.find((f) => f.id === currentForce);

  if (!force) throw new Error(INVALID_STATE);

  const enemyUnits = mapSquads.filter((u) => u.force !== currentForce);

  const getSquad = (unitId: string) => {
    let s = mapSquads.find((s) => s.id === unitId);

    if (!s) throw new Error(INVALID_STATE);

    return s;
  };

  const enemyVectors = enemyUnits.map((e) => e.pos);

  const enemyIndex = indexVectors(enemyVectors) as Map<
    string,
    Map<string, boolean>
  >;

  // Marks enemy-occupied cells as "walls"
  const updatedGrid: number[][] = blockVectorsInGrid(grid)(enemyIndex);

  const getUnitValidSteps = ({pos: {x, y}, range}: MapSquad): List<Step> => {
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

    const vectors = ys
      .map((y_) => xs.map((x_) => ({x: x_, y: y_})))
      .flatten(1) as List<Vector>;

    return vectors
      .filter(isInRange(range))
      .filter(isWalkable)
      .map(pathFinder)
      .filter((p) => p.length > 1)
      .filter(pathInRange)
      .map((l) => l.map(([x, y]) => ({x, y})))
      .map((steps: Vector[]) => ({
        target: steps[steps.length - 1],
        steps,
      }));
  };

  return force.squads.map(getSquad).map((mapSquad) => {
    const steps = getUnitValidSteps(mapSquad);

    return {
      ...mapSquad,
      validSteps: steps,
      enemiesInRange: mapSquads
        .filter((u) => mapSquad.force !== u.force)
        .filter((enemy: MapSquad) =>
          steps.some(
            (step) =>
              getDistance(step.target)(enemy.pos) === 1 &&
              getPathTo(grid)(mapSquad.pos)(enemy.pos).length <= mapSquad.range,
          ),
        )
        .map((enemy: MapSquad) => ({
          enemy: enemy.id,
          steps: getPathTo(grid)(mapSquad.pos)(enemy.pos)
            .slice(0, -1)
            .map(([x, y]) => makeVector(x)(y)),
        })),
    };
  });
};

export const blockVectorsInGrid = (grid: number[][]) => (
  blockIndex: Map<string, Map<string, boolean>>,
) =>
  grid.map((ys, y) =>
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

  return finder.findPath(source.x, source.y, target.x, target.y, pfGrid);
};

const indexVectors = (vectors: Vector[]) =>
  vectors.reduce((map, vec) => map.setIn([vec.y, vec.x], true), Map());
