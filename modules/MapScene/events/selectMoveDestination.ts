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

    clearEvents()

    layer.on(Phaser.Input.Events.POINTER_UP, movementOrderAssigned)

    function clearEvents() {
        layer.off(Phaser.Input.Events.POINTER_UP)
    }

    function movementOrderAssigned(pointer: Phaser.Input.Pointer) {
        const userDraggedInsteadOfClicking =
            Phaser.Math.Distance.Between(
                pointer.upX,
                pointer.upY,
                pointer.downX,
                pointer.downY
            ) > CLICK_THRESHOLD
        if (userDraggedInsteadOfClicking) return

        clearEvents()

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

