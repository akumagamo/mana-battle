import events from "../events"
import { EVENT_CLOSE_SELET_MOVE_DESTINATION } from "../UI/events/selectMoveDestination"

const UNIT_DATA_TARGET = "target"
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

    function adjustSpeed() {
        const pos = sprite.getBottomCenter()
        const tile = layer.getTileAtWorldXY(pos.x, pos.y)
        const isMoving =
            sprite.body.velocity.x !== 0 || sprite.body.velocity.y !== 0
        if (tile && isMoving) {
            const { angle } = sprite.body
            const { speed } = tile.properties
            sprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
        }
    }

    function clearEvents() {
        scene.events.off(Phaser.Scenes.Events.UPDATE, checkArrival)
        scene.events.off(Phaser.Scenes.Events.UPDATE, adjustSpeed)
        layer.off(Phaser.Input.Events.POINTER_UP)
    }

    function checkArrival() {
        const target = sprite.data.get(UNIT_DATA_TARGET) as Phaser.Math.Vector2
        const distance = Phaser.Math.Distance.BetweenPoints(sprite, target)

        if (distance <= 10) {
            sprite.body.velocity.reset()
            clearEvents()
            scene.events.emit("Squad Arrived", sprite.name)
        }
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
        scene.events.on(Phaser.Scenes.Events.UPDATE, checkArrival)
        scene.events.on(Phaser.Scenes.Events.UPDATE, adjustSpeed)

        events(scene).emit("Squad Deselected")
        events(scene).emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)
        scene.physics.world.resume()
    }
}
