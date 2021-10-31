import { CENTER_X, CENTER_Y } from "../_shared/constants"
import UI from "../UI"

export default (scene: Phaser.Scene) => {
    UI.button(scene)(CENTER_X, CENTER_Y + 200, "Credits", () =>
        buttonClicked(scene)
    )
}

async function buttonClicked(scene: Phaser.Scene) {
    ;[
        "Game Credits",
        "============",
        "Game Design & Programming",
        "Leonardo Farroco",
        "",
        "Music",
        "Johnatan Shaw",
    ].forEach((line, i) => {
        UI.text(scene)(CENTER_Y, 200 + i * 50, line)
    })
}
