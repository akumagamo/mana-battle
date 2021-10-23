import { fadeOut } from "../../../src/UI/Transition"
import { GAME_SPEED } from "../../_shared/env"
import { createEventKey, createHandler } from "../../_shared/events"
import MapScene from "../../Map/phaser"
import TitleScene from "../phaser"

//TODO: use value object
export const key = createEventKey("_NewGameButtonClicked")

async function handleNewGameButtonClicked(scene: Phaser.Scene): Promise<void> {
    await fadeOut(scene, 500 / GAME_SPEED)

    scene.scene.manager.add(MapScene.key, MapScene)
    scene.scene.manager.start(MapScene.key)

    scene.scene.remove(TitleScene.key)
}

export const handler = (scene: Phaser.Scene) =>
    createHandler<Phaser.Scene>(scene.events, key)

export const subscribe = (scene: Phaser.Scene) =>
    handler(scene).once(handleNewGameButtonClicked)
