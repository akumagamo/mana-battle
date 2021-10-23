import EventEmitter from "events"

type EventKey = { type: "_eventKey"; value: string }
export const createEventKey = (key: string): EventKey => {
    if (!key.startsWith("_"))
        throw new Error(
            `Error in event "${key}" name: event names must start with '_'`
        )
    else
        return {
            type: "_eventKey",
            value: key,
        }
}

export const createHandler = <ARGS>(
    emitter:
        | Phaser.Events.EventEmitter
        | Phaser.GameObjects.GameObject
        | EventEmitter,
    eventKey: EventKey
) => ({
    key: eventKey,
    on: (callback: (args: ARGS) => void) => {
        emitter.on(eventKey.value, callback)
    },
    once: (callback: (args: ARGS) => void) => {
        emitter.once(eventKey.value, callback)
    },
    emit: (args: ARGS) => {
        emitter.emit(eventKey.value, args)
    },
})
