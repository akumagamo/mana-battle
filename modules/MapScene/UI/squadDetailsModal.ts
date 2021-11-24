import UI from "../../UI"
import {
    CENTER_X,
    CENTER_Y,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from "../../_shared/constants"

export default (scene: Phaser.Scene) => () => {
    const group = scene.add.group().setName("Squad Details Window")

    const panel = scene.add
        .image(CENTER_X, CENTER_Y, "panel")
        .setDisplaySize(SCREEN_WIDTH / 1.5, SCREEN_HEIGHT / 1.5)

    const text = ["These are the squad details"].map((line, i) =>
        UI.text(scene)(CENTER_Y, 200 + i * 50, line)
            .setAlign("center")
            .setColor("#000")
    )

    const closeModalOption = UI.button(scene)(
        CENTER_X,
        SCREEN_HEIGHT - 200,
        "Close Squad Details",
        () => group.destroy(true)
    )

    ;[panel, ...text, closeModalOption].map((el) => group.add(el))
}
