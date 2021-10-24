import EventEmitter from "events"
import { createEventKey, createHandler } from "../_shared/events"
import { initialState, State, createScene, createSceneId } from "./Model"

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

export const listen = (emitter: EventEmitter) => {
    listenToUpdateState(emitter)
}

export const startScene = (id: string, effect: (id: string) => void) => {
    effect(id)
}

function listenToUpdateState(emitter: EventEmitter) {
    createHandler<State>(
        emitter,
        createEventKey("_UPDATE_STATE")
    ).on((newState: State) => setState(() => newState))
}
