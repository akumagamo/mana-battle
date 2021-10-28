import { Map, Range, List } from "immutable"
import { createUnit, Squad, UnitCollection } from "./Model"
import combat from "./combat"

const COMBAT_BOARD_WIDTH = 3

const pos = Range(0, COMBAT_BOARD_WIDTH, 1).toList()

const map2 = <A, B, C>(fn: (a: A, b: B) => C, a: List<A>, b: List<B>) =>
    a.map((a_) => b.map((b_) => fn(a_, b_))).flatten(2)

const positions = map2((a, b) => [a, b], pos, pos)

const createSquad = (id: string, numberOfUnits: number): Squad => ({
    id,
    units: positions
        .slice(0, numberOfUnits)
        .reduce(
            (xs, [x, y], key) =>
                xs.set(id + key, { ...createUnit(id + key, id), x, y }),
            Map() as UnitCollection
        ),
})

const squadA: Squad = createSquad("a", 2)
const squadB: Squad = createSquad("b", 2)

it("should generate an action for each unit, if all are alive", () => {
    const combat_ = combat(squadA, squadB)

    const allUnits = squadA.units.merge(squadB.units)
    expect(combat_.actions.length).toEqual(allUnits.size)
    allUnits.forEach((unit) => {
        expect(combat_.actions.map((action) => action.unit)).toContain(unit.id)
    })
})

it("should update the unit's HPs", () => {
    // Each squad has a single member, so each unit should be targeted once
    const a = createSquad("a", 1)
    const b = createSquad("b", 1)
    const combat_ = combat(a, b)
    const allUnits = a.units.merge(b.units)

    combat_.units.forEach((unit) => {
        expect(unit.hp).toBeLessThan(allUnits.get(unit.id)?.hp || Infinity)
    })
})
