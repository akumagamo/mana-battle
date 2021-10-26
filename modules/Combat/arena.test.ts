import { Map } from "immutable"
import { createArena, printArena } from "./arena"
import { UnitCollection } from "./Model"
import { defaultUnit } from "./utils.test"

const makeSquad = (id: string, ids: string[]) => ({
    id,
    units: ids.reduce(
        (xs, x, i) => xs.set(x, { ...defaultUnit, id: x, x: i, y: i }),
        Map() as UnitCollection
    ),
})

const squadA = makeSquad("s1", ["a", "b", "c"])
const squadB = makeSquad("s2", ["d", "e", "f"])

const arena = createArena(squadA, squadB)

it("should layout units as expected", () => {
    expect(printArena(arena)).toEqual(`
a ~ ~ ~ f ~ ~
~ b ~ ~ ~ e ~
~ ~ c ~ ~ ~ d
`)
})

it("should have the same x/y values in the unit as in the grid", () => {
    arena.units.forEach((unit) => {
        expect(unit.id).toEqual(arena.grid.getIn([unit.y, unit.x]))
    })
})

it("should place all units in the `units` prop", () => {
    squadA.units.merge(squadB.units).forEach((unit) => {
        expect(arena.units.get(unit.id)?.id).toEqual(unit.id)
    })
})
