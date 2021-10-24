import { fadeOut } from "../../src/UI/Transition"
import { CENTER_X, CENTER_Y } from "../_shared/constants"
import { GAME_SPEED } from "../_shared/env"
import MapScene from "../Map/phaser"
import TitleScene from "./phaser"
import UI from "../UI"

export default (scene: Phaser.Scene) => {
    UI.button(scene)(CENTER_X, CENTER_Y, "New Game", () => buttonClicked(scene))
}

async function buttonClicked(scene: Phaser.Scene) {
    await fadeOut(scene, 500 / GAME_SPEED)

    scene.scene.manager.add(MapScene.key, MapScene)
    scene.scene.manager.start(MapScene.key)

    scene.scene.remove(TitleScene.key)
}
