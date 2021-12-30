import { rights } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { Map } from "immutable"
import { ForceId } from "../Battlefield/Force"
import { createSquad, Squad, SquadId } from "../Battlefield/Squad"
import { createUnit } from "../Battlefield/Unit"
import combat from "./combat"
const squads = pipe(
    [
        createSquad("a", ForceId("PLAYER"), [
            [createUnit("u1"), { x: 2, y: 2 }],
        ]),
        createSquad("b", ForceId("COMPUTER"), [
            [createUnit("u9"), { x: 2, y: 2 }],
        ]),
    ],
    rights
)

if (squads.length !== 2) throw new Error()
const [a, b] = squads

const index = (Map() as Map<SquadId, Squad>).set(a.id, a).set(b.id, b)

it(`should generate an action for each unit, if all of them stay alive during
    the turn's course`, () => {
    const combat_ = combat(index)

    expect(combat_.actions.length).toEqual(
        squads.reduce((xs, x) => xs + x.members.size, 0)
    )

    squads.forEach((sqd) => {
        sqd.members.forEach((_m, k) => {
            expect(combat_.actions.map((action) => action.unit)).toContain(k)
        })
    })
})

it(`should record reduced HPs for attacked units (each squad with a
    single member, each being a fighter)`, () => {
    const combat_ = combat(index)

    squads.forEach((sqd) => {
        sqd.members.forEach((m, k) => {
            const [hp] = m.unit.hp
            const [value] = combat_.units.find((u) => u.id === k)?.hp || [0]
            expect(hp).toBeGreaterThan(value)
        })
    })
})
