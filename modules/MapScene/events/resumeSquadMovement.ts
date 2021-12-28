import events from "../events"
import { UNIT_DATA_TARGET } from "./selectMoveDestination"

export const listen = (
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.TilemapLayer
) =>
    events(scene).on(
        "Resume Squad Movement",
        (sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
            const target = sprite.data.get(
                UNIT_DATA_TARGET
            ) as Phaser.Math.Vector2
            const tile = map.getTileAtWorldXY(target.x, target.y)

            scene.physics.moveToObject(
                sprite,
                { x: target.x, y: target.y },
                tile.properties.speed
            )
        }
    )

export const emit = (
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) => events(sprite.scene).emit("Resume Squad Movement", sprite)
