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
    //remove from here (scenes should be decoupled)
    scene.scene.add(MapSceneUI.key, MapSceneUI)
    scene.scene.run(MapSceneUI.key)

    const map = createMap(scene)

    checkSquadOverlap(scene)

    const initialState = createInitialState(params)
    setState(scene, () => initialState)

    initialState.squads.forEach(createSquad(scene))

    initialState.cities.forEach(createCity(scene, initialState))

    fadeIn(scene, 500)

    scene.game.events.emit("Map Screen Created")

    events(scene).on("Select Move Destination", (squadId: string) => {
        selectMoveDestination(squadId, map, scene)
    })
}
