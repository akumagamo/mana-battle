import { State } from "../../Battlefield/State"
import events from "../events"
import moveSquadCancelled from "./events/moveSquadCancelled"
import { squadSelected } from "./events/squadSelected"
import pauseButton from "./pauseButton"

export const UNPAUSE_GAME_CMD = "Game Paused"
export const PAUSE_GAME_CMD = "Game Unpaused"
export const PAUSE_LABEL = "Pause"
export const UNPAUSE_LABEL = "Unpause"
export const PAUSE_BUTTON_KEY = "Pause Button"

export default async (scene: Phaser.Scene, state: State) => {
    scene.game.events.emit("Map Screen UI Created")

    events(scene).on("Squad Selected", squadSelected(scene, state))

    events(scene).on("Move Squad Cancelled", moveSquadCancelled(scene))

    events(scene).on("Destroy Pause Button", () =>
        scene.children.getByName(PAUSE_BUTTON_KEY)?.destroy()
    )
    pauseButton(scene)
}
