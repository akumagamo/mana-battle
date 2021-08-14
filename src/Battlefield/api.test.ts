// @ts-nocheck

import { getPathTo } from "./api"

const defaultGrid = [
    [0, 1, 1, 1, 1],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
]

test("Get moves in straight line", () => {
    const path = getPathTo(defaultGrid)({ x: 0, y: 1 })({ x: 0, y: 3 })

    const expected = [
        [0, 1],
        [0, 2],
        [0, 3],
    ]

    expect(path).toEqual(expected)
})

test("Make a turn", () => {
    const moves = getPathTo(defaultGrid)({ x: 0, y: 1 })({ x: 1, y: 3 })

    const expected = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 3],
    ]

    expect(moves).toEqual(expected)
})

test("Get shortest path in moves in a forked path ", () => {
    const grid = [
        [0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1],
    ]
    const moves = getPathTo(grid)({ x: 0, y: 0 })({ x: 3, y: 1 })

    const expected = [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
    ]

    expect(moves).toEqual(expected)
})
