import { Either, isLeft, isRight, Left, left, right } from "fp-ts/lib/Either"

export type Fallible<A> = Either<string[], A>

/**
 * Select -> Validate -> Run
 * If all assertions pass, the function is executed.
 */
export const runFallible = <A, B>(
    selectorResult: Fallible<A>,
    guards: Condition<A>[],
    fn: (a: A) => B
): Fallible<B> => {
    if (isLeft(selectorResult)) return selectorResult

    const guardErrors = guards
        .map((guard) => guard(selectorResult.right))
        .reduce(
            (xs, x) => (isLeft(x) ? xs.concat([x]) : xs),
            [] as Left<string>[]
        )
        .map((err) => err.left)

    if (guardErrors.length > 0) return left(guardErrors)

    return right(fn(selectorResult.right))
}
export type Condition<A> = (a: A) => Either<string, boolean>
export function Condition<A>(
    rule: string,
    check: (a: A) => boolean
): Condition<A> {
    return (a: A) => {
        if (check(a)) return right(true)
        else return left(rule)
    }
}
