import { UNIT_DATA_TARGET } from "./selectMoveDestination"

export default (
        map: Phaser.Tilemaps.TilemapLayer,
        sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    ) =>
    (scene: Phaser.Scene) => {
        const { x, y } = sprite.data.get(UNIT_DATA_TARGET)
        const tile = map.getTileAtWorldXY(x, y)

        scene.physics.moveToObject(sprite, { x, y }, tile.properties.speed)
    }
