import { isLeft } from "fp-ts/lib/Either"
import { Map } from "immutable"
import { ForceId } from "../Battlefield/Force"
import { createSquad, Squad, SquadId } from "../Battlefield/Squad"
import { createUnit, Unit, UnitId } from "../Battlefield/Unit"
import { createArena, showArena } from "./arena"

const makeSquad = (
    id: string,
    force: string,
    ids: string[]
): { squad: Squad; units: [Unit, { x: number; y: number }][] } => {
    const units = ids.reduce(
        (xs, x, i) => xs.concat([[createUnit(x), { x: i, y: i }]]),
        [] as [Unit, { x: number; y: number }][]
    )
    const sqd = createSquad(id, ForceId(force), units)

    if (isLeft(sqd)) throw new Error()
    else
        return {
            squad: sqd.right,
            units,
        }
}

const { squads, units } = [
    makeSquad("s1", "PLAYER", ["a", "b", "c"]),
    makeSquad("s2", "COMPUTER", ["d", "e", "f"]),
].reduce(
    (xs, { squad, units }) => ({
        squads: xs.squads.set(squad.id, squad),
        units: xs.units.merge(Map(units.map(([u]) => [u.id, u]))),
    }),
    {
        squads: Map() as Map<SquadId, Squad>,
        units: Map() as Map<UnitId, Unit>,
    }
)

const arena = createArena(units, squads)
it("should layout units as expected", () => {
    expect(showArena(arena)).toEqual(`
a ~ ~ ~ f ~ ~
~ b ~ ~ ~ e ~
~ ~ c ~ ~ ~ d
`)
})

it("should have the same x/y values in the squad member position as in the grid", () => {
    arena.squads.forEach((squad) => {
        squad.members.forEach((m, k) => {
            expect(k).toEqual(arena.grid.getIn([m.position.y, m.position.x]))
        })
    })
})
