import { Range } from "immutable"
import {
    createForce,
    addSquad,
    dispatchSquad,
    retreatSquad,
    removeSquad,
    addUnit,
    removeUnit,
} from "./Force"
import * as Errors from "./Force.errors"
import { Squad, SquadId } from "./Squad"
import { createUnit, UnitId } from "./Unit"

const ids = Range(0, 10)
    .toList()
    .toJS()
    .map((n) => UnitId((n as number).toString()))

const defaultForce = ids
    .map(createUnit)
    .reduce((xs, x) => addUnit(xs, x), createForce("test"))

describe("addSquad", () => {
    test("should report an error if trying to add an unit that is not benched", () => {
        const [errs, force_] = addSquad(defaultForce, [UnitId("x1")])

        expect(errs).toStrictEqual([Errors.UNIT_NOT_IN_BENCH("x1")])
        expect(defaultForce).toStrictEqual(force_)
    })
    test("should remove units from bench when squad is created", () => {
        const [_, force_] = addSquad(defaultForce, ids.slice(0, 3))

        ids.slice(0, 3).forEach((id) => {
            expect(force_.unitsWithoutSquad.has(id)).toBeFalsy()
        })
    })
    test("should place units in newly created squad", () => {
        expect(defaultForce.nonDispatchedSquads.size).toEqual(0)

        const testIds = ids.slice(0, 3)

        const [_, force] = addSquad(defaultForce, testIds)

        const squad = force.nonDispatchedSquads.first() as Squad

        expect(squad.members.keySeq().toJS()).toEqual(testIds)
    })

    test("should report an error if trying to pass an empty list of units", () => {
        const [errs, force_] = addSquad(defaultForce, [])

        expect(errs).toStrictEqual([Errors.FORCE_SQUAD_MIN_SIZE])
        expect(defaultForce).toStrictEqual(force_)
    })
    test("should report an error if passing more than 5 units", () => {
        const [errs, force_] = addSquad(defaultForce, ids)

        expect(errs).toStrictEqual([Errors.FORCE_SQUAD_MAX_SIZE])
        expect(defaultForce).toStrictEqual(force_)
    })
})
describe("dispatchSquad", () => {
    test("should report an error passing a squad id that is not benched", () => {
        const [errs, force_] = dispatchSquad(defaultForce, SquadId("s1"))

        expect(errs).toStrictEqual([Errors.SQUAD_NOT_BENCHED("s1")])
        expect(defaultForce).toStrictEqual(force_)
    })

    test("should move the squad from the bench to the dispatched collection", () => {
        const [_, force] = addSquad(defaultForce, ids.slice(0, 3))

        const id = SquadId("force/test/squads/0")
        expect((force.nonDispatchedSquads.first() as Squad).id).toEqual(id)
        expect(force.dispatchedSquads.isEmpty()).toBeTruthy()

        const [__, force_] = dispatchSquad(force, id)

        expect((force_.dispatchedSquads.first() as Squad).id).toEqual(id)
        expect(force_.nonDispatchedSquads.isEmpty()).toBeTruthy()
    })
})

describe("retreatSquad", () => {
    test("should report an error passing a squad id that is not dispatched", () => {
        const [errs, force_] = retreatSquad(defaultForce, SquadId("s1"))

        expect(errs).toStrictEqual([Errors.SQUAD_NOT_DISPATCHED("s1")])
        expect(defaultForce).toStrictEqual(force_)
    })
    test("should move the squad from the dispatched collection to the bench", () => {
        const [_, force] = addSquad(defaultForce, ids.slice(0, 3))

        const id = SquadId("force/test/squads/0")
        const [__, dispatched] = dispatchSquad(force, id)

        expect((dispatched.dispatchedSquads.first() as Squad).id).toEqual(id)
        expect(dispatched.nonDispatchedSquads.isEmpty()).toBeTruthy()

        const [___, force_] = retreatSquad(dispatched, id)

        expect((force_.nonDispatchedSquads.first() as Squad).id).toEqual(id)
        expect(force_.dispatchedSquads.isEmpty()).toBeTruthy()
    })
})

describe("removeSquad", () => {
    test("should report an error passing a squad id that is not benched", () => {
        const [errs, force_] = removeSquad(defaultForce, SquadId("s1"))

        expect(errs).toStrictEqual([Errors.SQUAD_NOT_BENCHED("s1")])
        expect(defaultForce).toStrictEqual(force_)
    })
    test("should remove squad from the bench", () => {
        const id = SquadId("force/test/squads/0")

        const [_, forceWithSquad] = addSquad(defaultForce, ids.slice(0, 3))
        const [errs, forceAfterSquadRemoval] = removeSquad(forceWithSquad, id)

        expect(errs).toStrictEqual([])
        expect(forceAfterSquadRemoval.nonDispatchedSquads.has(id)).toBeFalsy()
    })
    test("should place units in the bench", () => {
        const id = SquadId("force/test/squads/0")

        const [_, forceWithSquad] = addSquad(defaultForce, ids.slice(0, 3))
        const squad = forceWithSquad.nonDispatchedSquads.get(id) as Squad

        const [_errs, forceAfterSquadRemoval] = removeSquad(forceWithSquad, id)

        console.log(forceAfterSquadRemoval)
        squad.members.forEach((_v, k) =>
            expect(forceAfterSquadRemoval.unitsWithoutSquad.has(k)).toBeTruthy()
        )
    })
})

describe("removeUnit", () => {
    test("should report error if trying to remove an unit not in the bench", () => {
        const [errs, force] = removeUnit(defaultForce, UnitId("x1"))

        console.log(force.unitsWithoutSquad.toJS())
        expect(errs).toStrictEqual([Errors.UNIT_NOT_IN_BENCH("x1")])
        expect(defaultForce).toStrictEqual(force)
    })
    test("should remove valid unit from the bench", () => {
        const [id] = ids
        const [_errs, force] = removeUnit(defaultForce, id)

        expect(force.unitsWithoutSquad.has(id)).toBeFalsy()
    })
})
