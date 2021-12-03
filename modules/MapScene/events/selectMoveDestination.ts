import events from "../events"
import {
    EVENT_CLOSE_SELET_MOVE_DESTINATION,
    SELECTED_SQUAD_OPTIONS,
} from "../UI/events/selectMoveDestination"

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

        // move this to sprite.on...
        scene.events.emit("Resume Squad Movement", sprite)

        //todo: move this to ui event "enable options"
        const elements = SELECTED_SQUAD_OPTIONS.map((name) =>
            scene.scene.get("Map Screen UI").children.getByName(name)
        ) as Phaser.GameObjects.Container[]
        elements.forEach((el) => el.setAlpha(1).setInteractive())

        events(scene).emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)
    }
}

function clearEvents(layer: Phaser.Tilemaps.TilemapLayer) {
    layer.off(Phaser.Input.Events.POINTER_UP)
}
