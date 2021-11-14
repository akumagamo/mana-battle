import { fadeIn } from "../UI/Transition"
import checkSquadOverlap from "./events/checkSquadOverlap"
import { createMap } from "./map"
import { createInitialState, getState } from "./Model"
import { createSquad } from "./squad"
import MapSceneUI from "./UI/phaser"

export const create = async (scene: Phaser.Scene) => {
    scene.scene.add(MapSceneUI.key, MapSceneUI)
    scene.scene.run(MapSceneUI.key)

    const map = createMap(scene)

    checkSquadOverlap(scene)

    createInitialState(scene)

    getState(scene).squads.forEach(createSquad(scene, map))

    fadeIn(scene, 500)

    scene.game.events.emit("Map Screen Created")
}
