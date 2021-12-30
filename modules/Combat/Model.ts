
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
