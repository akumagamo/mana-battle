import { Map } from "immutable"

export type Job = {
    id: string
    skills: {
        front: string
        middle: string
        back: string
    }
}

export type Unit = {
    id: string
    name: string
    speed: number
    x: number
    y: number
}

export type Squad = Map<string, Unit>
