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

    events(scene).emit("Squad Selected", sprite.name)

    scene.physics.world.pause()
}
