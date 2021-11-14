import {
    CENTER_X,
    CENTER_Y,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
} from "../_shared/constants"
import UI from "../UI"
import { GameObjects } from "phaser"

export default (scene: Phaser.Scene) => {
    UI.button(scene)(CENTER_X, CENTER_Y + 200, "Credits", () =>
        buttonClicked(scene)
    )
}

async function buttonClicked(scene: Phaser.Scene) {
    const container = scene.add.container().setName("Credits Window")

    const panel = scene.add
        .image(CENTER_X, CENTER_Y, "panel")
        .setDisplaySize(SCREEN_WIDTH / 1.5, SCREEN_HEIGHT / 1.5)

    const text = [
        "Game Credits",
        "> Game Design & Programming",
        "Leonardo Farroco",
        "> Music",
        "Jonathan Shaw",
    ].map((line, i) =>
        UI.text(scene)(CENTER_Y, 200 + i * 50, line)
            .setAlign("center")
            .setColor("#000")
    )

    const closeCreditsBtn = UI.button(scene)(
        CENTER_X,
        SCREEN_HEIGHT - 200,
        "Close Credits",
        () => container.destroy()
    )

    container.add([panel, ...text, closeCreditsBtn])
}
