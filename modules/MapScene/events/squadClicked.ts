import { ForceId } from "../../Battlefield/Force"
import { SquadId } from "../../Battlefield/Squad"
import events from "../events"

export default function (
    forceId: ForceId,
    squadId: SquadId,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    scene: Phaser.Scene
) {
    if (
        scene.scene
            .get("Map Screen UI")
            .children.getByName("Select Destination")
    )
        return

    scene.children.each((child) =>
        child.name.endsWith("/cursor") ? child.destroy() : null
    )
    const cursor = scene.add
        .image(0, 0, "chara_cursor")
        .setScale(0.2)
        .setName(sprite.name + "/cursor")
        .on("removedfromscene", () => {
            scene.events.removeListener("update", updatePosition)
        })

    scene.events.on("update", updatePosition)

    scene.children.bringToTop(sprite)

    events(scene).emit("Squad Selected", forceId, squadId)

    function updatePosition() {
        cursor.setPosition(sprite.x, sprite.y + 30)
    }
}
