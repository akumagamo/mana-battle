import EventEmitter from "events"
import { createHandler } from "../_shared/events"
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

export const startScene = (
    emitter: EventEmitter,
    id: string,
    effect: () => void
) => {
    const newState = { ...state, scene: createScene(createSceneId(id)) }
    createHandler<State>(emitter, "UPDATE_STATE").emit(newState)
    effect()
}

function listenToUpdateState(emitter: EventEmitter) {
    createHandler<State>(emitter, "UPDATE_STATE").on((newState: State) =>
        setState(() => newState)
    )
}
