import { left, right } from "fp-ts/lib/Either"
import {
    Condition,
    runFallible,
    selectNullable,
    validateProperties,
} from "./Fallible"

test("it should run a valid check", () => {
    const result = runFallible(
        right(8),
        [Condition("It should be 8", (n) => n / 2 === 4)],
        (one) => one * 2
    )

    expect(result).toStrictEqual(right(16))
})

test("it should not run an invalid check", () => {
    const result = runFallible(
        right(9),
        [Condition("It should be 8", (n) => n / 2 === 4)],
        (n) => n * 2
    )

    expect(result).toStrictEqual(left(["It should be 8"]))
})
test("it should report only failed checks", () => {
    const result = runFallible(
        right(11),
        [
            Condition("It should be greater than 8", (n) => n > 8),
            Condition("It should be even", (n) => n % 2 === 0),
        ],
        () => "this will not run"
    )

    expect(result).toEqual(left(["It should be even"]))
})

test("it should not break if selectors fail", () => {
    const result = runFallible(
        left(["sorry"]),
        [Condition("It should be 8", (one) => one / 2 === 4)],
        (one) => one * 2
    )

    expect(result).toEqual(left(["sorry"]))
})

test("it should propagate errors if a selector has failed", () => {
    const result = runFallible(
        left(["sorry!", "the value is not here."]),
        [
            Condition("It should be 8", (n) => n === 8),
            Condition("It should be 4", (n) => n === 4),
        ],
        (n) => n
    )

    expect(result).toEqual(left(["sorry!", "the value is not here."]))
})

type User = {
    name: string
    age: number
    zipcode: number
}

test("should propagate errors if validating invalid object", () => {
    const result = validateProperties<User>({
        name: right("name"),
        age: right(22),
        zipcode: left(["invalid zipcode"]),
    })

    expect(result).toStrictEqual(left(["invalid zipcode"]))
})

test("should return object if properties are valid", () => {
    const result = validateProperties<User>({
        name: right("name"),
        age: right(22),
        zipcode: right(188999),
    })

    expect(result).toStrictEqual(
        right({
            name: "name",
            age: 22,
            zipcode: 188999,
        })
    )
})
test("should generating an error when selecting a nullable", () => {
    const result = selectNullable("an error", null)
    expect(result).toStrictEqual(left(["an error"]))
})
test("should generate a valid value if not selecting a nullable", () => {
    const result = selectNullable("an error", 22)
    expect(result).toStrictEqual(right(22))
})
