import { CENTER_X, CENTER_Y, SCREEN_HEIGHT } from "../_shared/constants"
import UI from "../UI"
import { GameObjects } from "phaser"

export default (scene: Phaser.Scene) => {
    UI.button(scene)(CENTER_X, CENTER_Y + 200, "Credits", () =>
        buttonClicked(scene)
    )
}

async function buttonClicked(scene: Phaser.Scene) {
    const text = [
        "Game Credits",
        "============",
        "Game Design & Programming",
        "Leonardo Farroco",
        "",
        "Music",
        "Johnatan Shaw",
    ].map((line, i) => UI.text(scene)(CENTER_Y, 200 + i * 50, line))

    const closeCreditsBtn = UI.button(scene)(
        CENTER_X,
        SCREEN_HEIGHT - 200,
        "Close Credits",
        () => {
            scene.data
                .get("closeCreditsBtn")
                .forEach((el: GameObjects.GameObject) => el.destroy())
            scene.data.remove("closeCreditsBtn")
        }
    )

    const elements = [...text, closeCreditsBtn]

    scene.data.set("closeCreditsBtn", elements)
}
