import EventEmitter from "events"
import { emptyState, State } from "./State"
import * as Map from "../MapScene/Model"
import MapSceneUI from "../MapScene/UI/phaser"

export const main = (scene: Phaser.Scene) => {
    const state: State = emptyState

    const events = new EventEmitter()

    const params = Map.createMapScreenProperties({
        squads: [
            [100, 100, "PLAYER"],
            [200, 100, "CPU"],
        ],
        cities: [
            [50, 50, "PLAYER"],
            [250, 250, "CPU"],
        ],
    })

    events.on("start", () => {
        const initialState = Map.createInitialState(params)
        scene.game.events.emit("Start Map Screen", params)

        createUI(initialState, scene)
    })

    events.on("destroy", () => {
        events.removeAllListeners()
    })

    return events
}
function createUI(initialState: Map.State, scene: Phaser.Scene) {
    const UI = MapSceneUI(initialState)
    scene.scene.add(UI.key, UI)
    scene.scene.run(UI.key)
}
