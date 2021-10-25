import EventEmitter from "events"

const emitter = new EventEmitter.EventEmitter()

export const bootGame = (bootIO: (ev: EventEmitter) => void) => {
    bootIO(emitter)
}
