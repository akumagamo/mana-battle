import pauseButton from "./pauseButton"

export const PAUSE_LABEL = "Pause"
export const UNPAUSE_LABEL = "Unpause"
export const PAUSE_BUTTON_KEY = "Pause Button"

export default async (scene: Phaser.Scene) => {
    scene.game.events.emit("Map Screen UI Created")

    pauseButton(scene)
}
