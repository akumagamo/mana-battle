import button from "../../UI/button"
import { SCREEN_WIDTH } from "../../_shared/constants"
import { UNIT_DATA_TARGET } from "../events/selectMoveDestination"
import resumeSquadMovement from "../events/resumeSquadMovement"
import {
    UNPAUSE_GAME_CMD,
    PAUSE_GAME_CMD,
    UNPAUSE_LABEL,
    PAUSE_LABEL,
    PAUSE_BUTTON_KEY,
} from "./create"
import { MapScreen } from "../Model"

export default function (scene: Phaser.Scene) {
    const mapScreen = MapScreen(scene.scene.manager)

    mapScreen.events.on(UNPAUSE_GAME_CMD, () => {
        mapScreen.physics.resume()

        // Phaser bug? When a move order is issued
        // when the physics engine is paused, the sprite
        // moves infinitelly to the right.
        // Here we reissue the move order (if any) to all squads
        mapScreen.children.each((sprite) => {
            if (sprite.data && sprite.data.get(UNIT_DATA_TARGET))
                resumeSquadMovement(
                    sprite as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
                )(scene)
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
