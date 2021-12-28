import { ForceId } from "../../Battlefield/Force"
import { SquadId } from "../../Battlefield/Squad"
import events from "../events"
import * as selectMoveDestinationUI from "../UI/events/selectMoveDestination"
import resumeSquadMovement from "../events/resumeSquadMovement"
import { MapScreen } from "../Model"

export const UNIT_DATA_TARGET = "target"
const CLICK_THRESHOLD = 5

export default function selectMoveDestination(
    forceId: ForceId,
    squadId: SquadId,
    scene: Phaser.Scene
) {
    const mapScreen = MapScreen(scene.scene.manager)

    const sprite = mapScreen.getSprite(squadId)

    const layer = mapScreen.tilemap()
    clearEvents(layer)

    layer.on(
        Phaser.Input.Events.POINTER_UP,
        movementOrderAssigned(forceId, sprite)
    )
}
function movementOrderAssigned(
    forceId: ForceId,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    return (pointer: Phaser.Input.Pointer) => {
        const { scene } = sprite
        const mapScreen = MapScreen(scene.scene.manager)
        const userDraggedInsteadOfClicking =
            Phaser.Math.Distance.Between(
                pointer.upX,
                pointer.upY,
                pointer.downX,
                pointer.downY
            ) > CLICK_THRESHOLD

        if (userDraggedInsteadOfClicking) return

        const layer = mapScreen.tilemap()
        clearEvents(layer)

        const target = { x: pointer.worldX, y: pointer.worldY }
        sprite.data.set(UNIT_DATA_TARGET, target)

        resumeSquadMovement(sprite)(scene)

        mapScreen.events.closeSelectMoveDestionation()

        mapScreen.events.squadSelected(forceId, SquadId(sprite.name))

        sprite.emit("updateAnimation")
    }
}

function clearEvents(layer: Phaser.Tilemaps.TilemapLayer) {
    layer.off(Phaser.Input.Events.POINTER_UP)
}
