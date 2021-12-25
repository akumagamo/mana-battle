import { Either, isLeft, left, right } from "fp-ts/lib/Either"

/**
 * If all assertions pass, the function is executed.
 */
export const runFallible = <A, B>(
    selectorResult: Either<string[], A>,
    guards: [string, (a: A) => boolean][],
    fn: (a: A) => B
): Either<string[], B> => {
    if (isLeft(selectorResult)) return selectorResult

    const guardErrors = guards.filter(([, fn]) => !fn(selectorResult.right))

    if (guardErrors.length > 0) return left(guardErrors.map(([err]) => err))

    return right(fn(selectorResult.right))
}
