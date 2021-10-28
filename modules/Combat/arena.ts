import { List, Map } from "immutable"
import { Squad, Unit } from "./Model"

type Grid = Map<number, Map<number, string>>

export type Arena = {
    units: Map<string, Unit>
    grid: Grid
}

export function createArena(squadA: Squad, squadB: Squad) {
    const coords = List([0, 1, 2])
    const extendedCoords = coords
        .concat([coords.size])
        .concat(coords.map(transpose))

    const arena = coords.reduce(
        (xs, x) =>
            xs.set(
                x,
                Map(extendedCoords.map(n => [n, "~"])) as Map<number, string>
            ),
        Map() as Grid
    )

    const invertedSquadB = squadB.units.map(unit => ({
        ...unit,
        x: transpose(invert(unit.x)),
        y: invert(unit.y),
    }))

    const squadArena = squadA.units
        .merge(invertedSquadB)
        .reduce((xs, x) => xs.setIn([x.y, x.x], x.id), Map() as Grid)

    return {
        units: squadA.units.merge(invertedSquadB),
        grid: arena.mergeDeep(squadArena),
    }

    function transpose(n: number): number {
        return n + coords.size + 1
    }

    function invert(n: number): number {
        return coords.reverse().get(n) || 0
    }
}

export function printArena(arena: Arena) {
    return (
        "\n" +
        arena.grid
            .map(col => col.toList().join(" "))
            .toList()
            .join("\n") +
        "\n"
    )
}
