import { State } from "../../Battlefield/State"
import button from "../../UI/button"
import { SCREEN_WIDTH } from "../../_shared/constants"
import events from "../events"
import { UNIT_DATA_TARGET } from "../events/selectMoveDestination"
import moveSquadCancelled from "./events/moveSquadCancelled"
import listenToSelectMovesDestinationEvents from "./events/selectMoveDestination"
import { squadSelected } from "./events/squadSelected"

const UNPAUSE_GAME_CMD = "Game Paused"
const PAUSE_GAME_CMD = "Game Unpaused"
const PAUSE_LABEL = "Pause"
const UNPAUSE_LABEL = "Unpause"
const PAUSE_BUTTON_KEY = "Pause Button"

export default async (scene: Phaser.Scene, state: State) => {
    const mapScreen = scene.scene.get("Map Screen")
    scene.game.events.emit("Map Screen UI Created")

    events(scene).on("Squad Selected", squadSelected(scene, state))

    listenToSelectMovesDestinationEvents(scene)

    events(scene).on("Move Squad Cancelled", moveSquadCancelled(scene))

    events(scene).on("Create Pause Button", () => pauseButton(scene, mapScreen))
    events(scene).on("Destroy Pause Button", () =>
        scene.children.getByName(PAUSE_BUTTON_KEY)?.destroy()
    )
    events(scene).emit("Create Pause Button")
}

function pauseButton(scene: Phaser.Scene, mapScreen: Phaser.Scene) {
    mapScreen.events.on(UNPAUSE_GAME_CMD, () => {
        mapScreen.physics.resume()

        // Phaser bug? When a move order is issued
        // when the physics engine is paused, the sprite
        // moves infinitelly to the right.
        // Here we reissue the move order (if any) to all squads
        mapScreen.children.each((sprite) => {
            if (sprite.data && sprite.data.get(UNIT_DATA_TARGET))
                mapScreen.events.emit("Resume Squad Movement", sprite)
        })
    })

    mapScreen.events.on(PAUSE_GAME_CMD, () => {
        mapScreen.physics.pause()
    })

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
                mapScreen.events.emit(UNPAUSE_GAME_CMD)
            } else {
                text.setText(UNPAUSE_LABEL)
                mapScreen.events.emit(PAUSE_GAME_CMD)
            }
        }
    ).setName(PAUSE_BUTTON_KEY)
}
