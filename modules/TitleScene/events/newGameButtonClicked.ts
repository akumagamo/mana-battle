//import { fadeOut } from "../../../UI/Transition"

import {createEvent} from "../../../src/utils"

export const key = "NewGameButtonClicked"

async function handleNewGameButtonClicked(scene: Phaser.Scene): Promise<void> {
    //await fadeOut(scene, 500 / GAME_SPEED)
    scene.scene.stop()

    // changescene instead
    //startCharaCreationScene(scene)
}

export const handler = (scene: Phaser.Scene) =>
    createEvent<Phaser.Scene>(scene.events, key)

export const subscribe = (scene: Phaser.Scene) =>
    handler(scene).once(handleNewGameButtonClicked)

