import { isRight, left, right } from "fp-ts/lib/Either"
import { runFallible } from "./Result"

test("it should run a valid check", () => {
    const result = runFallible(
        right(8),
        [["It should be 8", (one) => one / 2 === 4]],
        (one) => one * 2
    )

    expect(result).toStrictEqual(right(16))
})

test("it should not run an invalid check", () => {
    const result = runFallible(
        right(9),
        [["It should be 8", (n) => n / 2 === 4]],
        (n) => n * 2
    )

    expect(result).toStrictEqual(left(["It should be 8"]))
})
test("it should report only failed checks", () => {
    const result = runFallible(
        right(11),
        [
            ["It should be greater than 8", (n) => n > 8],
            ["It should be even", (n) => n % 2 === 0],
        ],
        () => "this will not run"
    )

    expect(result).toEqual(left(["It should be even"]))
})

test("it should not break if selectors fail", () => {
    const result = runFallible(
        left(["sorry"]),
        [["It should be 8", (one) => one / 2 === 4]],
        (one) => one * 2
    )

    expect(result).toEqual(left(["sorry"]))
})

test("it should propagate errors if a selector has failed", () => {
    const result = runFallible(
        left(["sorry!", "the value is not here."]),
        [
            ["It should be 8", (n) => n === 8],
            ["It should be 4", (n) => n === 4],
        ],
        (n) => n
    )

    expect(result).toEqual(left(["sorry!", "the value is not here."]))
})
