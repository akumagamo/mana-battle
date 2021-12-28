import { MapScreen } from "../Model"

export function adjustSpeed(scene: Phaser.Scene) {
    return () =>
        (
            scene.children.getAll(
                "type",
                //@ts-ignore
                "Sprite"
            ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]
        ).forEach((sprite) => {
            const isMoving =
                sprite.body.velocity.x !== 0 || sprite.body.velocity.y !== 0
            if (isMoving) {
                const pos = sprite.getBottomCenter()
                const tile = MapScreen(scene.scene.manager)
                    .tilemap()
                    .getTileAtWorldXY(pos.x, pos.y)
                if (!tile) return

                const { angle } = sprite.body
                const { speed } = tile.properties
                sprite.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                )
            }
        })
}
