import { PathFinding } from "astarjs";
import { Vector, walkableTilesWeights } from "./Model";

export const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

export const getPathTo = (grid: number[][]) => (source: Vector) => (
  target: Vector
): number[][] => {
  let pathFindingManager = new PathFinding();
  pathFindingManager
    .setWalkable(...walkableTilesWeights)
    .setStart({ row: source.y, col: source.x })
    .setEnd({ row: target.y, col: target.x });

  console.log(grid);
  const path = pathFindingManager
    .find(grid)
    .map((cell) => [cell.col, cell.row]);

  return path;
};
