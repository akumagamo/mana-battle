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
}

export type UnitCollection = Map<string, Unit>

export type Squad = { id: string; units: UnitCollection }
