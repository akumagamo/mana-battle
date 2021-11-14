import { CENTER_X, CENTER_Y } from "../_shared/constants"
import { GAME_SPEED } from "../_shared/env"
import TitleScene from "./phaser"
import UI from "../UI"
import MapScene from "../MapScene/phaser"
import { fadeOut } from "../UI/Transition"

export default (scene: Phaser.Scene) => {
    UI.button(scene)(CENTER_X, CENTER_Y, "New Game", () => buttonClicked(scene))
    scene.input.keyboard.on(
        Phaser.Input.Keyboard.Events.KEY_DOWN + "ENTER",
        () => {
            buttonClicked(scene)
        }
    )
}

async function buttonClicked(scene: Phaser.Scene) {
    await fadeOut(scene, 500 / GAME_SPEED)

    scene.scene.add(MapScene.key, MapScene)
    scene.scene.start(MapScene.key)
    scene.scene.remove(TitleScene.key)
}
