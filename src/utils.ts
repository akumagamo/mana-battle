import { Map } from "immutable"
import { Vector } from "./Battlefield/Model"

export const indexById = (xs: Map<string, { id: string }>, x: { id: string }) =>
    xs.set(x.id, x)

export const maybeZero = (v: number | undefined | null) => (v ? v : 0)

export function randomItem<T>(items: Array<T>): T {
    return items[Math.floor(Math.random() * items.length)]
}

export function getDistance(a: Vector, b: Vector) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
export type EventFactory<ARGS> = {
    on: (callback: (args_: ARGS) => void) => void
    once: (callback: (args_: ARGS) => void) => void
    emit: (args: ARGS) => void
}

export const createEvent = <ARGS>(
    emitter: Phaser.Events.EventEmitter | Phaser.GameObjects.GameObject,
    key: string
): EventFactory<ARGS> => ({
    on: (callback: (args: ARGS) => void) => {
        emitter.on(key, callback)
    },
    once: (callback: (args: ARGS) => void) => {
        emitter.once(key, callback)
    },
    emit: (args: ARGS) => {
        emitter.emit(key, args)
    },
})

