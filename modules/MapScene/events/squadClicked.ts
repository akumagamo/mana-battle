const UNIT_DATA_TARGET = "target"
const CLICK_THRESHOLD = 5

export default function (
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    layer: Phaser.Tilemaps.TilemapLayer,
    scene: Phaser.Scene
) {
    scene.scene.get("Map Screen UI").events.emit("Squad Selected", sprite.name)

    scene.physics.world.pause()
}
