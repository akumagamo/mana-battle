import { fadeOut } from "../../../src/UI/Transition"
import { GAME_SPEED } from "../../_shared/env"
import { createHandler } from "../../_shared/events"

export const key = "NewGameButtonClicked"

async function handleNewGameButtonClicked(scene: Phaser.Scene): Promise<void> {
    await fadeOut(scene, 500 / GAME_SPEED)
    scene.scene.stop()

    // changescene
}

export const handler = (scene: Phaser.Scene) =>
    createHandler<Phaser.Scene>(scene.events, key)

export const subscribe = (scene: Phaser.Scene) =>
    handler(scene).once(handleNewGameButtonClicked)
