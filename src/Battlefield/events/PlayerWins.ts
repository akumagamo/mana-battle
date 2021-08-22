import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants"
import button from "../../UI/button"
import panel from "../../UI/panel"
import text from "../../UI/text"
import { createEvent } from "../../utils"

export const key = "PlayerWins"

export default (scene: Phaser.Scene) =>
    createEvent<Phaser.Scene>(scene.events, key)

export const onPlayerWins = (scene: Phaser.Scene) => {
    const container = scene.add.container()
    panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container)

    text(500, 300, "YOU WIN!", container)

    button(500, 350, "Continue", container, () => {
        console.log("continue")
    })
}
