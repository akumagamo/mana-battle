import { createEvent } from "../../utils"
import { changeMode } from "../Mode"
import { MapSquad, MapState } from "../Model"

export const key = "MovePlayerSquadButonClicked"
export default (scene: Phaser.Scene) =>
    createEvent<{
        scene: Phaser.Scene
        state: MapState
        mapSquad: MapSquad
    }>(scene.events, key)

export function handleMovePlayerSquadButtonClicked({
    mapSquad,
    state,
    scene,
}: {
    scene: Phaser.Scene
    state: MapState
    mapSquad: MapSquad
}) {
    changeMode(scene, state, {
        type: "SELECT_SQUAD_MOVE_TARGET",
        id: mapSquad.id,
        start: mapSquad.posScreen,
    })
    state.isPaused = true
}
