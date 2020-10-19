import * as PF from 'pathfinding';
import S from 'sanctuary';
import {Vector, TurnManager, MapSquad, Step} from './Model';
import {MapState} from './Model';
import {Map, Range} from 'immutable';
import {INVALID_STATE} from '../../errors';

export const findById = (list: {id: string}[]) => (id: string) =>
  list.find((n) => n.id === id);

const makeVector = (x: number) => (y: number) => ({x, y});

export const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

export const unitsFromForce = (state: MapState) => (id: string) =>
  S.filter((u: MapSquad) => u.force === id)(state.mapSquads);

export const getUnit = (state: MapState) => (id: string) =>
  findById(state.mapSquads)(id);

export const getForce = (state: MapState) => (id: string) =>
  findById(state.forces)(id);

export const getEntities = (entityList: {id: string}[]) => (idList: string) =>
  S.pipe([S.map((id: string) => findById(entityList)(id)), S.justs])(idList);

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

  let bb = force.squads.map(getSquad).map((mapSquad) => {
    const steps = getUnitValidSteps(mapSquad);

    const targets = S.map((step: Step) => step.target)(steps);

    return {
      ...mapSquad,
      validSteps: steps,
      enemiesInRange: S.pipe([
        S.filter((u: MapSquad) => mapSquad.force !== u.force),
        S.filter((enemy: MapSquad) =>
          S.any(
            (step: Vector) =>
              getDistance(step)(enemy.pos) === 1 &&
              getPathTo(grid)(mapSquad.pos)(enemy.pos).length <= mapSquad.range,
          )(targets),
        ),
        S.map((enemy: MapSquad) => ({
          enemy: enemy.id,
          steps: getPathTo(grid)(mapSquad.pos)(enemy.pos)
            .slice(0, -1)
            .map(([x, y]) => makeVector(x)(y)),
        })),
      ])(mapSquads),
    };
  });

  return bb;
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
