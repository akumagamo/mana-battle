import { PathFinding } from "astarjs"
import { Vector, walkableTilesWeights } from "./Model"

export const getDistance = (vec1: Vector) => (vec2: Vector) =>
    Math.abs(vec1.x - vec2.x) + Math.abs(vec1.y - vec2.y)

export const getPathTo = (grid: number[][]) => (source: Vector) => (
    target: Vector
): number[][] => {
    //TODO: replace pathfinding library, it is returning an empty path when
    //a movement of just y-1 is attempted
    const pathFindingManager = new PathFinding()

    pathFindingManager
        .setWalkable(...walkableTilesWeights)
        .setStart({ row: source.y, col: source.x })
        .setEnd({ row: target.y, col: target.x })

    const distance = getDistance(source)(target)

    if (distance > 1) {
        const path = pathFindingManager
            .find(grid)
            .map(cell => [cell.col, cell.row])

        return path
    } else {
        return [
            [source.x, source.y],
            [target.x, target.y],
        ]
    }
}
