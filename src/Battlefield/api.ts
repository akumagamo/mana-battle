import { PathFinding } from "astarjs";
import { Vector } from "./Model";

export const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

export const getPathTo = (grid: number[][]) => (source: Vector) => (
  target: Vector
): number[][] => {
  let pathFindingManager = new PathFinding();
  pathFindingManager
    .setWalkable(0)
    .setStart({ row: source.y, col: source.x })
    .setEnd({ row: target.y, col: target.x });

  const path = pathFindingManager
    .find(grid)
    .map((cell) => [cell.col, cell.row]);

  return path;
};
