import { ForceId } from "../../Battlefield/Force"
import { SquadId } from "../../Battlefield/Squad"
import { MapScreen } from "../Model"

export default (scene: Phaser.Scene) => (forceId: ForceId, squadId: SquadId) => {
    const { events, getSprite } = MapScreen(scene.scene.manager)

    const sprite = getSprite(squadId)
    if (
        scene.scene
            .get("Map Screen UI")
            .children.getByName("Select Destination")
    )
        throw new Error()

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

    events.squadSelected(forceId, squadId)

    function updatePosition() {
        cursor.setPosition(sprite.x, sprite.y + 30)
    }
}
