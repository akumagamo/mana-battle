import { List, Map } from "immutable"
import { Member, Squad, SquadId } from "../Battlefield/Squad"
import { Unit, UnitId } from "../Battlefield/Unit"

type Grid = Map<number, Map<number, string>>

export type Arena = {
    squads: Map<SquadId, Squad>
    units: Map<UnitId, Unit>
    grid: Grid
}

export function createArena(
    units: Map<UnitId, Unit>,
    squads: Map<SquadId, Squad>
): Arena {
    const coords = List([0, 1, 2])
    const extendedCoords = coords
        .concat([coords.size])
        .concat(coords.map(transpose))

    const playerSquad = squads.find((sqd) => sqd.force === "PLAYER")

    if (!playerSquad) throw new Error()

    const enemySquad = squads.find((sqd) => sqd.force !== "PLAYER")

    if (!enemySquad) throw new Error()

    const arena = coords.reduce(
        (xs, x) =>
            xs.set(
                x,
                Map(extendedCoords.map((n) => [n, "~"])) as Map<number, string>
            ),
        Map() as Grid
    )

    const invertedEnemySquad: Map<UnitId, Member> = enemySquad.members.map(
        (member) => ({
            ...member,
            position: {
                x: transpose(invert(member.position.x)),
                y: invert(member.position.y),
            },
        })
    )

    const squadArena = playerSquad.members.merge(invertedEnemySquad)

    const grid = squadArena.reduce(
        (xs, x, k) => xs.setIn([x.position.y, x.position.x], k),
        Map() as Grid
    )

    return {
        squads: squads.map((sqd) => ({
            ...sqd,
            members: squadArena.filter((m) => m.squad === sqd.id),
        })),
        units,
        grid: arena.mergeDeep(grid),
    }

    function transpose(n: number): number {
        return n + coords.size + 1
    }

    function invert(n: number): number {
        return coords.reverse().get(n) || 0
    }
}

export function showArena(arena: Arena) {
    return (
        "\n" +
        arena.grid
            .map((col) => col.toList().join(" "))
            .toList()
            .join("\n") +
        "\n"
    )
}
