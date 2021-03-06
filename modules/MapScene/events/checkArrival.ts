import { ARRIVED_AT_TARGET } from "../squad"
import { UNIT_DATA_TARGET } from "./selectMoveDestination"

export function checkArrival(scene: Phaser.Scene) {
    return () => {
        ;(
            scene.children.getAll(
                "type",
                //@ts-ignore
                "Sprite"
            ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]
        ).forEach((sprite) => {
            const isMoving =
                sprite.body.velocity.x !== 0 || sprite.body.velocity.y !== 0
            const target = sprite.data.get(
                UNIT_DATA_TARGET
            ) as Phaser.Math.Vector2 | null

            if (!isMoving || !target) return

            const distance = Phaser.Math.Distance.BetweenPoints(sprite, target)

            if (distance <= 10) {
                sprite.body.velocity.reset()
                scene.events.emit("Squad Arrived", sprite.name)
                sprite.emit(ARRIVED_AT_TARGET)
            }
        })
    }
}
