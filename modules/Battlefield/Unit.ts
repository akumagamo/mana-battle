export type UnitId = string & { _unitId: never }
export const UnitId = (s: string) => s as UnitId

export type Unit = {
    id: UnitId
    name: string
}
export const createUnit = (id: string): Unit => ({
    id: UnitId(id),
    name: "",
})
