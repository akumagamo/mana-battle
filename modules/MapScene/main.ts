import { fadeIn } from "../UI/Transition"
import checkSquadOverlap from "./events/checkSquadOverlap"
import selectMoveDestination from "./events/selectMoveDestination"
import { createMap } from "./map"
import { createInitialState, MapScreenProperties, setState } from "./Model"
import { createSquad } from "./squad"
import { createCity } from "./city"
import MapSceneUI from "./UI/phaser"
import events from "./events"

export default async (scene: Phaser.Scene, params: MapScreenProperties) => {
    const map = createMap(scene)

    checkSquadOverlap(scene)

    const initialState = createInitialState(params)
    const setState_ = setState(initialState)

    const UI = MapSceneUI(initialState)

    scene.scene.add(UI.key, UI)
    scene.scene.run(UI.key)

    initialState.squads.forEach(createSquad(scene))

    initialState.cities.forEach(createCity(scene))

    fadeIn(scene, 500)

    scene.game.events.emit("Map Screen Created")

    events(scene).on("Select Move Destination", (squadId: string) => {
        selectMoveDestination(squadId, map, scene)
    })
}
