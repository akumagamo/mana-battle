import button from "../../UI/button"
import { SCREEN_WIDTH } from "../../_shared/constants"
import { UNPAUSE_LABEL, PAUSE_LABEL, PAUSE_BUTTON_KEY } from "./create"
import { MapScreen } from "../Model"

export default function (scene: Phaser.Scene) {
    const { scene: mapScreen, events } = MapScreen(scene)

    button(scene)(
        SCREEN_WIDTH - 150,
        40,
        mapScreen.physics.world.isPaused ? UNPAUSE_LABEL : PAUSE_LABEL,
        (
            _container: Phaser.GameObjects.Container,
            text: Phaser.GameObjects.Text
        ) => {
            if (mapScreen.physics.world.isPaused) {
                text.setText(PAUSE_LABEL)
                events.unpauseGame()
            } else {
                text.setText(UNPAUSE_LABEL)

                events.pauseGame()
            }
        }
    ).setName(PAUSE_BUTTON_KEY)
}
