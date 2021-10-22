import EventEmitter from "events"
import { BoundedNumber, createBoundedNumber } from "../_shared/BoundedNumber"

type SceneId = { _valueType: "sceneId"; value: string }

export const createSceneId = (id: string): SceneId => ({
    _valueType: "sceneId",
    value: id,
})
export type Scene = {
    _valueType: "scene"
    id: SceneId
}

export const createScene = (id: SceneId): Scene => ({
    _valueType: "scene",
    id,
})

type Volume = {
    general: BoundedNumber<0, 100>
    music: BoundedNumber<0, 100>
    effects: BoundedNumber<0, 100>
}

export type State = {
    currentScene: Scene
    volume: Volume
}

export const initialState: State = {
    currentScene: createScene(createSceneId("TitleScene")),
    volume: {
        general: createBoundedNumber(0, 100, 100),
        music: createBoundedNumber(0, 100, 100),
        effects: createBoundedNumber(0, 100, 100),
    },
}

export const COMMANDS = {
    UPDATE_SCENE: "UPDATE_SCENE",
    UPDATE_VOLUME_GENERAL: "UPDATE_VOLUME_GENERAL",
    UPDATE_VOLUME_MUSIC: "UPDATE_VOLUME_MUSIC",
    UPDATE_VOLUME_EFFECT: "UPDATE_VOLUME_EFFECT",
}


