import { CENTER_X, CENTER_Y } from "../_shared/constants"
import { GAME_SPEED } from "../_shared/env"
import TitleScene from "./phaser"
import UI from "../UI"
import { fadeOut } from "../UI/Transition"
import { createMapScreenProperties } from "../MapScene/Model"
import { main } from "../Battlefield/main"

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
    const defaultParameters = createMapScreenProperties({
        squads: [
            [100, 100, "PLAYER"],
            [200, 200, "CPU"],
            [800, 900, "PLAYER"],
            [900, 900, "PLAYER"],
        ],
        cities: [
            [50, 50, "PLAYER"],
            [250, 250, "CPU"],
            [450, 950, "CPU"],
        ],
    })

    const ev = main(scene)

    ev.emit("start")

    scene.scene.remove(TitleScene.key)
}
