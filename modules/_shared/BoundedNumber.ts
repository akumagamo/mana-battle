export type BoundedNumber<MIN extends number, MAX extends number> = {
    _valueType: "boundedNumber"
    value: number
    min: MIN
    max: MAX
}

export const createBoundedNumber = <MIN extends number, MAX extends number>(
    min: MIN,
    max: MAX,
    value: number
): BoundedNumber<MIN, MAX> => {
    if (max < min || min > max) {
        throw new Error(`Invalid bounded number range: ${min}-${max} `)
    }
    const normalize = () => {
        if (value < min) return min
        if (value > max) return max
        else return value
    }
    return {
        _valueType: "boundedNumber",
        min,
        max,
        value: normalize(),
    }
}

export const updateBoundedNumber = <MIN extends number, MAX extends number>(
    boundedNumber: BoundedNumber<MIN, MAX>,
    value: number
): BoundedNumber<MIN, MAX> => {
    return createBoundedNumber(boundedNumber.min, boundedNumber.max, value)
}
