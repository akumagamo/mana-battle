import events from "../events"
import pauseButton from "./pauseButton"

export const PAUSE_LABEL = "Pause"
export const UNPAUSE_LABEL = "Unpause"
export const PAUSE_BUTTON_KEY = "Pause Button"

export default async (scene: Phaser.Scene) => {
    scene.game.events.emit("Map Screen UI Created")

    events(scene).on("Destroy Pause Button", () =>
        scene.children.getByName(PAUSE_BUTTON_KEY)?.destroy()
    )
    pauseButton(scene)
}
