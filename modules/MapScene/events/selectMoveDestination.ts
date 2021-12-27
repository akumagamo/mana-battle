import { ForceId } from "../../Battlefield/Force"
import { Squad, SquadId } from "../../Battlefield/Squad"
import events from "../events"
import { EVENT_CLOSE_SELET_MOVE_DESTINATION } from "../UI/events/selectMoveDestination"

export const UNIT_DATA_TARGET = "target"
const CLICK_THRESHOLD = 5

export default function (
    forceId: ForceId,
    squadId: SquadId,
    layer: Phaser.Tilemaps.TilemapLayer,
    scene: Phaser.Scene
) {
    const sprite = scene.scene
        .get("Map Screen")
        .children.getByName(
            squadId
        ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody

    clearEvents(layer)

    layer.on(
        Phaser.Input.Events.POINTER_UP,
        movementOrderAssigned(forceId, sprite, layer)
    )
}
function movementOrderAssigned(
    forceId: ForceId,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    layer: Phaser.Tilemaps.TilemapLayer
) {
    return (pointer: Phaser.Input.Pointer) => {
        const { scene } = sprite
        const userDraggedInsteadOfClicking =
            Phaser.Math.Distance.Between(
                pointer.upX,
                pointer.upY,
                pointer.downX,
                pointer.downY
            ) > CLICK_THRESHOLD

        if (userDraggedInsteadOfClicking) return

        clearEvents(layer)

        const target = { x: pointer.worldX, y: pointer.worldY }
        sprite.data.set(UNIT_DATA_TARGET, target)

        scene.events.emit("Resume Squad Movement", sprite)

        events(scene).emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)

        events(scene).emit("Squad Selected", forceId, sprite.name)

        sprite.emit("updateAnimation")
    }
}

function clearEvents(layer: Phaser.Tilemaps.TilemapLayer) {
    layer.off(Phaser.Input.Events.POINTER_UP)
}
