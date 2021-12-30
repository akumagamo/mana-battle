export type UnitId = string & { _unitId: never }
export const UnitId = (s: string) => s as UnitId

export type Unit = {
    id: UnitId
    name: string
    speed: PositiveNumber
    hp: BoundedPositiveNumber
    job: string
}

export const job = (job: string) => ({
    job,
})
export const speed = (speed: number) => ({
    speed: PositiveNumber(speed),
})

type PositiveNumber = number & {
    _tag_PositiveNumber: never
}
export const PositiveNumber = (n: number) => (n < 0 ? 0 : n) as PositiveNumber
type BoundedPositiveNumber = [PositiveNumber, PositiveNumber] & {
    _tag_BoundedPositiveNumber: never
}
export const hp = ([min, max]: [number, number]) => ({
    hp: boundedPositiveNumber(PositiveNumber(min), PositiveNumber(max)),
})

function boundedPositiveNumber(min: PositiveNumber, max: PositiveNumber) {
    return [
        min > max ? max : min,
        max < min ? min : max,
    ] as BoundedPositiveNumber
}

export const singletonUnit = {
    id: UnitId("NULL"),
    name: "",
    ...job("soldier"),
    ...speed(10),
    ...hp([50, 50]),
}
export const createUnit = (id: string): Unit => ({
    ...singletonUnit,
    id: UnitId(id),
})
