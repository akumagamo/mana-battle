import { Set } from "immutable"
import { GAME_SPEED } from "../env"
import { fadeIn } from "../UI/Transition"
import { enableMapInput } from "./board/input"
import renderMap from "./board/renderMap"
import renderSquads from "./board/renderSquads"
import renderStructures from "./board/renderStructures"
import { makeWorldDraggable, setWorldBounds } from "./dragging"
import destroySquad from "./events/destroySquad"
import { MapState } from "./Model"
import pushSquad from "./squads/pushSquad"
import startCombat from "./squads/startCombat"
import subscribe from "./subscribe"
import { refreshUI } from "./ui"
import update from "./update"
import { checkCollision } from "./update/checkCollision"

export default async (scene: Phaser.Scene, state: MapState) => {
    subscribe(scene, state)

    scene.input.mouse.disableContextMenu()

    scene.events.on("update", () => {
        update(scene, state)
    })

    if (process.env.SOUND_ENABLED) {
        scene.sound.stopAll()
        const music = scene.sound.add("map1")

        //@ts-ignore
        music.setVolume(0.3)
        music.play()
    }

    state.mapContainer = scene.add.container(state.mapX, state.mapY)
    state.uiContainer = scene.add.container()
    state.missionContainer = scene.add.container()

    renderMap(scene, state)
    renderStructures(scene, state)
    renderSquads(scene, state)

    await fadeIn(scene, 1000 / GAME_SPEED)

    makeWorldDraggable(scene, state)
    //setWorldBounds(state)

    await Promise.all(state.squadsToRemove.map((id) => destroySquad(state, id)))
    state.squadsToRemove = Set()

    // if (!scene.hasShownVictoryCondition) {
    //   victoryCondition(scene);
    //   scene.hasShownVictoryCondition = true;
    // }

    await pushSquad(scene, state)

    if (state.squadToPush) {
        const collided = checkCollision(state)(state.squadToPush.loser)
        if (collided) {
            startCombat(
                scene,
                state,
                state.squads
                    .filter((squad) =>
                        [collided.id, state.squadToPush?.loser].includes(
                            squad.id
                        )
                    )
                    .map((s) => s.squad)
            )
        }

        state.squadToPush = null
    }

    enableMapInput(scene, state)

    refreshUI(scene, state)
}
