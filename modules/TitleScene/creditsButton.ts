import { CENTER_X, CENTER_Y } from "../_shared/constants"
import UI from "../UI"

export default (scene: Phaser.Scene) => {
    UI.button(scene)(CENTER_X, CENTER_Y + 200, "Credits", () =>
        buttonClicked(scene)
    )
}

async function buttonClicked(_scene: Phaser.Scene) {
    console.log(`credits`)
}
