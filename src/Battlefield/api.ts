import * as PF from "pathfinding";
import { Vector } from "./Model";

export const getDistance = (vec1: Vector) => (vec2: Vector) =>
  Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y);

export const getPathTo = (grid: number[][]) => (source: Vector) => (
  target: Vector
): number[][] => {
  const pfGrid = new PF.Grid(grid);
  const finder = new PF.AStarFinder();

  return finder.findPath(source.x, source.y, target.x, target.y, pfGrid);
};
