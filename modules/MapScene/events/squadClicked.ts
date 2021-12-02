import events from "../events"

export default function (
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
    scene.add
        .image(sprite.x, sprite.y + 25, "chara_cursor")
        .setScale(0.2)
        .setName(sprite.name + "/cursor")

    scene.children.bringToTop(sprite)

    events(scene).emit("Squad Selected", sprite.name)

    scene.physics.world.pause()
}
