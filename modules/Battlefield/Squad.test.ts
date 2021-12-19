import { createForce } from "./Force"
import { boardIndex, createSquad } from "./Squad"

test("should create a 2d board based on width and height", () => {
    expect(boardIndex(2, 2)).toStrictEqual([
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
    ])
})

// test("should return an error if trying to create a squad with a non existing unit", () => {
//     const [errs, force] = createForce("test", defaultUnits, [
//         createSquad("s1", [["z0", { x: 1, y: 1 }]]),
//     ])
//     expect(errs[0]).toContain(
//         "Trying to create a squad with a non-existing unit"
//     )
//     expect(force).toBeNull()
// })
// test("should return an error if trying to create a squad with more units than the limit", () => {
//     const [errs, force] = createForce("test", defaultUnits, [
//         createSquad("s1", [
//             ["u1", { x: 1, y: 1 }],
//             ["u2", { x: 2, y: 1 }],
//             ["u3", { x: 3, y: 1 }],
//             ["u4", { x: 1, y: 2 }],
//             ["u5", { x: 2, y: 2 }],
//             ["u6", { x: 3, y: 2 }],
//         ]),
//     ])
//     expect(errs).toEqual(["Squad above size limit of 5"])
//     expect(force).toBeNull()
// })
// test("should report errors if trying to create a squad with two units in the same position", () => {
//     const [errs, force] = createForce("test", defaultUnits, [
//         createSquad("s1", [
//             ["u1", { x: 1, y: 1 }],
//             ["u2", { x: 1, y: 1 }],
//         ]),
//     ])
//     expect(errs).toEqual([
//         'Unit "u1" has the same position of unit "u2": {"x":1,"y":1}',
//         'Unit "u2" has the same position of unit "u1": {"x":1,"y":1}',
//     ])
//     expect(force).toBeNull()
// })
