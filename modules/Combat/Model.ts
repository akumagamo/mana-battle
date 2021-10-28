import { Map } from "immutable"

type RowSkill = {
    id: string
    times: number
}

export type RowPosition = "back" | "middle" | "front"

export type Skill = {
    id: string
    damage: number
}

export type Job = {
    id: string
    skills: {
        [x in RowPosition]: RowSkill
    }
}

export type Unit = {
    id: string
    name: string
    speed: number
    x: number
    y: number
    job: string
    squad: string
    hp: number
    maxHp: number
}

export const createUnit = (id: string, squad: string): Unit => ({
    id,
    name: "",
    speed: 1,
    x: 0,
    y: 0,
    job: "fighter",
    squad,
    hp: 50,
    maxHp: 50,
})

export type UnitCollection = Map<string, Unit>

export type Squad = { id: string; units: UnitCollection }
