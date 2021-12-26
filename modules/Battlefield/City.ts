import { ForceId } from "./Force"

export type CityId = string & { _unitId: never }
export const CityId = (s: string) => s as CityId

export type City = {
    id: CityId
    name: string
    position: { x: number; y: number }
    force: ForceId | null
}
export const createCity = (id: string): City => ({
    name: `City ${id}`,
    id: CityId(id),
    position: { x: 0, y: 0 },
    force: null,
})
