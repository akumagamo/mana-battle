import events from "../events"
import { EVENT_CLOSE_SELET_MOVE_DESTINATION } from "../UI/events/selectMoveDestination"

export const UNIT_DATA_TARGET = "target"
const CLICK_THRESHOLD = 5

export default function (
    squadId: string,
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
        movementOrderAssigned(sprite, layer)
    )
}
function movementOrderAssigned(
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
        const tile = layer.getTileAtWorldXY(target.x, target.y)
        scene.physics.moveToObject(
            sprite,
            { x: pointer.worldX, y: pointer.worldY },
            tile.properties.speed
        )

        events(scene).emit("Squad Deselected")
        events(scene).emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)
        scene.physics.world.resume()
    }
}

function clearEvents(layer: Phaser.Tilemaps.TilemapLayer) {
    layer.off(Phaser.Input.Events.POINTER_UP)
}
