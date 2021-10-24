import EventEmitter from "events"
import { initialState, State } from "./Model"

let state = { ...initialState }

export const setState = (fn: (s: State) => State) => {
    if (process.env.NODE_ENV === "development") {
        console.log(`setState - prev: `, state)
    }

    state = fn(state)

    if (process.env.NODE_ENV === "development") {
        console.log(`setState - next: `, state)
    }
}
export const getState = () => state

export const startScene = (id: string, effect: (id: string) => void) => {
    effect(id)
}

export function listenToUpdateState(emitter: EventEmitter) {
    emitter.on("UPDATE_STATE", (newState: State) => setState(() => newState))
}
