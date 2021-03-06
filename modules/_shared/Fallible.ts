import { Either, isLeft, Left, left, right } from "fp-ts/lib/Either"

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

export function validateProperties<M>(obj: {
    [x in keyof M]: Fallible<M[keyof M]>
}): Fallible<{ [x in keyof M]: M[keyof M] }> {
    const values: Fallible<M[keyof M]>[] = Object.values(obj)

    const failures = values.reduce(
        (xs, v) => (isLeft(v) ? xs.concat(v.left) : xs),
        [] as string[]
    )

    if (failures.length > 0) return left(failures)
    else {
        const entries: [k: string, v: Fallible<M[keyof M]>][] =
            Object.entries(obj)

        const values = entries.reduce((xs, [k, v]) => {
            if (isLeft(v)) return xs
            else return { ...xs, [k]: v.right }
        }, {} as { [x in keyof M]: M[keyof M] })
        return right(values)
    }
}
export const selectNullable = <A>(cond: string, v: A | null): Fallible<A> => {
    if (v === null) return left([cond])
    else return right(v)
}
