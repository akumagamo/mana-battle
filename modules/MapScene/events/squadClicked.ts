import events from "../events"

export default function (
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    scene: Phaser.Scene
) {
    events.emit("Squad Selected", sprite.name)

    scene.physics.world.pause()
}
