export const equals: <T>(a: T, b: T) => void = <T>(a: T, b: T) =>
    expect(a).toStrictEqual(b)
