import { isRight } from "fp-ts/lib/Either"
import { ForceId } from "./Force"
import { boardIndex, createSquad, unitInSamePositionError } from "./Squad"
import { createUnit } from "./Unit"

test("should create a 2d board based on width and height", () => {
    expect(boardIndex(2, 2)).toStrictEqual([
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
    ])
})

test("should report errors if trying to create a squad with two units in the same position", () => {
    const res = createSquad("0", ForceId("f1"), [
        [createUnit("u1"), { x: 1, y: 1 }],
        [createUnit("u2"), { x: 1, y: 1 }],
    ])

    if (isRight(res)) throw new Error()

    expect(res.left).toEqual([
        unitInSamePositionError("u1", { x: 1, y: 1 }),
        unitInSamePositionError("u2", { x: 1, y: 1 }),
    ])
})
