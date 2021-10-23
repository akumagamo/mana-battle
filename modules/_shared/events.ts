import EventEmitter from "events"

export const createHandler = <ARGS>(
    emitter:
        | Phaser.Events.EventEmitter
        | Phaser.GameObjects.GameObject
        | EventEmitter,
    key: string
) => ({
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
