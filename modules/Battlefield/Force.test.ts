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
    .reduce((xs, x) => addUnit(x)(xs), createForce("test"))

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
        const result = addSquad(ids.slice(0, 8))(defaultForce)

        expect(result).toStrictEqual(left([Errors.FORCE_SQUAD_MAX_SIZE]))
    })
})
describe("dispatchSquad", () => {
    test("should report an error passing a squad id that is not benched", () => {
        const id = SquadId(defaultForce.id, "some non existing id")
        const result = dispatchSquad(id)(defaultForce)

        expect(result).toStrictEqual(left([Errors.SQUAD_NOT_BENCHED(id)]))
    })

    test("should move the squad from the bench to the dispatched collection", () => {
        const forceWithSquad = expectNoErrors(
            pipe(defaultForce, addSquad(ids.slice(0, 3)))
        )

        const id = forceWithSquad.nonDispatchedSquads.first()?.id

        const forceWithoutSquad = expectNoErrors(
            dispatchSquad(id as SquadId)(forceWithSquad)
        )

        expect(forceWithoutSquad.dispatchedSquads.first()?.id).toEqual(id)
        expect(forceWithoutSquad.nonDispatchedSquads.isEmpty()).toBeTruthy()
    })
})

describe("retreatSquad", () => {
    test("should report an error passing a squad id that is not dispatched", () => {
        const id = SquadId(defaultForce.id, "some non existing id")
        const result = retreatSquad(id)(defaultForce)

        expect(result).toStrictEqual(left([Errors.SQUAD_NOT_DISPATCHED(id)]))
    })
    test("should move the squad from the dispatched collection to the bench", () => {
        const benchedForce = expectNoErrors(
            pipe(defaultForce, addSquad(ids.slice(0, 3)))
        )

        const id = benchedForce.nonDispatchedSquads.first()?.id as SquadId

        const result = expectNoErrors(
            pipe(benchedForce, dispatchSquad(id), chain(retreatSquad(id)))
        )

        expect(result.dispatchedSquads.size).toEqual(0)
        expect(result.nonDispatchedSquads.size).toEqual(1)
    })
})

describe("removeSquad", () => {
    test("should report an error passing a squad id that is not benched", () => {
        const id = SquadId(defaultForce.id, "some non existing id")
        const result = removeSquad(id)(defaultForce)

        expect(result).toStrictEqual(left([Errors.SQUAD_NOT_BENCHED(id)]))
    })
    test("should remove squad from the bench", () => {
        const benchedForce = expectNoErrors(
            pipe(defaultForce, addSquad(ids.slice(0, 3)))
        )

        const id = benchedForce.nonDispatchedSquads.first()?.id as SquadId
        const result = expectNoErrors(removeSquad(id)(benchedForce))

        expect(result.nonDispatchedSquads.isEmpty()).toBeTruthy()
    })
    test("should place units from removed squad in the bench", () => {
        const ids_ = defaultForce.unitsWithoutSquad
            .slice(0, 3)
            .keySeq()
            .toJS() as UnitId[]

        const benchedForce = expectNoErrors(pipe(defaultForce, addSquad(ids_)))

        const id = benchedForce.nonDispatchedSquads.first()?.id as SquadId

        const result = expectNoErrors(removeSquad(id)(benchedForce))

        ids_.forEach((id) =>
            expect(result.unitsWithoutSquad.has(id)).toBeTruthy()
        )
    })
})

describe("removeUnit", () => {
    test("should report error if trying to remove an unit not in the bench", () => {
        const result = removeUnit(defaultForce, UnitId("some non existing id"))

        expect(result).toStrictEqual(
            left([Errors.UNIT_NOT_IN_BENCH("some non existing id")])
        )
    })
    test("should remove valid unit from the bench", () => {
        const [id] = ids
        const result = expectNoErrors(removeUnit(defaultForce, id))

        expect(result.unitsWithoutSquad.has(id)).toBeFalsy()
    })
})

describe("updateUnit", () => {
    test("should report error if trying to remove an unit not in the bench", () => {
        const result = updateUnit(
            defaultForce,
            createUnit("some non existing id")
        )

        expect(result).toStrictEqual(
            left([Errors.UNIT_NOT_IN_BENCH("some non existing id")])
        )
    })
    test("should update valid unit in the bench", () => {
        const [id] = ids

        const updatedUnit = { ...createUnit(id), name: "new name" }
        const result = expectNoErrors(updateUnit(defaultForce, updatedUnit))

        expect(result.unitsWithoutSquad.get(id)?.name).toEqual(updatedUnit.name)
    })
})

function expectNoErrors(result: Fallible<Force>) {
    if (isLeft(result)) throw new Error(result.left.join(","))
    else return result.right
}
