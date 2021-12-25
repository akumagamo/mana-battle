import { isLeft, left, chain } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/function"
import { Range } from "immutable"
import { Fallible } from "../_shared/Fallible"
import {
    createForce,
    addSquad,
    dispatchSquad,
    retreatSquad,
    removeSquad,
    addUnit,
    removeUnit,
    updateUnit,
    Force,
} from "./Force"
import * as Errors from "./Force.errors"
import { SquadId } from "./Squad"
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
        const result = addSquad([UnitId("x1")])(defaultForce)

        expect(result).toStrictEqual(left([Errors.UNIT_NOT_IN_BENCH("x1")]))
    })
    test("should remove units from bench when squad is created", () => {
        const result = addSquad(ids.slice(0, 3))(defaultForce)

        ids.slice(0, 3).forEach((id) => {
            const right = expectNoErrors(result)

            expect(right.unitsWithoutSquad.has(id)).toBeFalsy()
        })
    })
    test("should place units in newly created squad", () => {
        expect(defaultForce.nonDispatchedSquads.size).toEqual(0)

        const testIds = ids.slice(0, 3)

        const result = addSquad(testIds)(defaultForce)

        const right = expectNoErrors(result)

        const squad = right.nonDispatchedSquads.first()
        expect(squad?.members.keySeq().toJS()).toEqual(testIds)
    })

    test("should report an error if trying to pass an empty list of units", () => {
        const result = addSquad([])(defaultForce)

        expect(result).toStrictEqual(left([Errors.FORCE_SQUAD_MIN_SIZE]))
    })
    test("should report an error if passing more than 5 units", () => {
        const result = addSquad(ids)(defaultForce)

        expect(result).toStrictEqual(left([Errors.FORCE_SQUAD_MAX_SIZE]))
    })
})
describe("dispatchSquad", () => {
    test("should report an error passing a squad id that is not benched", () => {
        const result = dispatchSquad(SquadId("s1"))(defaultForce)

        expect(result).toStrictEqual(left([Errors.SQUAD_NOT_BENCHED("s1")]))
    })

    test("should move the squad from the bench to the dispatched collection", () => {
        const id = SquadId("force/test/squads/0")
        const result = pipe(
            defaultForce,
            addSquad(ids.slice(0, 3)),
            chain(dispatchSquad(id))
        )

        const right = expectNoErrors(result)

        expect(right.dispatchedSquads.first()?.id).toEqual(id)
        expect(right.nonDispatchedSquads.isEmpty()).toBeTruthy()
    })
})

describe("retreatSquad", () => {
    test("should report an error passing a squad id that is not dispatched", () => {
        const result = retreatSquad(SquadId("s1"))(defaultForce)

        expect(result).toStrictEqual(left([Errors.SQUAD_NOT_DISPATCHED("s1")]))
    })
    test("should move the squad from the dispatched collection to the bench", () => {
        const id = SquadId("force/test/squads/0")

        const result = pipe(
            defaultForce,
            addSquad(ids.slice(0, 3)),
            chain(dispatchSquad(id)),
            chain(retreatSquad(id))
        )

        const right = expectNoErrors(result)

        expect(right.dispatchedSquads.size).toEqual(0)
        expect(right.nonDispatchedSquads.size).toEqual(1)
    })
})

describe("removeSquad", () => {
    test("should report an error passing a squad id that is not benched", () => {
        const result = removeSquad(SquadId("s1"))(defaultForce)

        expect(result).toStrictEqual(left([Errors.SQUAD_NOT_BENCHED("s1")]))
    })
    test("should remove squad from the bench", () => {
        const id = SquadId("force/test/squads/0")

        const result = pipe(
            defaultForce,
            addSquad(ids.slice(0, 3)),
            chain(removeSquad(id))
        )
        const right = expectNoErrors(result)

        expect(right.nonDispatchedSquads.has(id)).toBeFalsy()
    })
    test("should place units from removed squad in the bench", () => {
        const id = SquadId("force/test/squads/0")

        const ids_ = ids.slice(0, 3)
        const result = pipe(
            defaultForce,
            addSquad(ids_),
            chain(removeSquad(id))
        )

        const right = expectNoErrors(result)

        ids_.forEach((id) =>
            expect(right.unitsWithoutSquad.has(id)).toBeTruthy()
        )
    })
})

describe("removeUnit", () => {
    test("should report error if trying to remove an unit not in the bench", () => {
        const result = removeUnit(defaultForce, UnitId("x1"))

        expect(result).toStrictEqual(left([Errors.UNIT_NOT_IN_BENCH("x1")]))
    })
    test("should remove valid unit from the bench", () => {
        const [id] = ids
        const result = removeUnit(defaultForce, id)

        const right = expectNoErrors(result)

        expect(right.unitsWithoutSquad.has(id)).toBeFalsy()
    })
})

describe("updateUnit", () => {
    const newUnit = (id: string) => ({ id: UnitId(id), name: "New Name" })
    test("should report error if trying to remove an unit not in the bench", () => {
        const result = updateUnit(defaultForce, newUnit("x1"))

        expect(result).toStrictEqual(left([Errors.UNIT_NOT_IN_BENCH("x1")]))
    })
    test("should update valid unit in the bench", () => {
        const [id] = ids
        const result = updateUnit(defaultForce, newUnit(id))

        const right = expectNoErrors(result)

        expect(right.unitsWithoutSquad.get(id)?.name).toEqual(newUnit(id).name)
    })
})

function expectNoErrors(result: Fallible<Force>) {
    if (isLeft(result)) throw new Error(result.left.join(","))
    else return result.right
}
