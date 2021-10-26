import unitClicked from "./events/unitClicked"

const UNIT_WIDTH = 50
const UNIT_HEIGHT = 100

export function createUnit(
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.TilemapLayer,
    x: number,
    y: number
) {
    const unit = scene.physics.add.sprite(x, y, "button")
    unit.setDataEnabled()
    unit.setSize(UNIT_WIDTH, UNIT_HEIGHT)
    unit.setDisplaySize(UNIT_WIDTH, UNIT_HEIGHT)
    unit.body.setSize(UNIT_WIDTH * 4, UNIT_HEIGHT)
    createUnitEvents(scene, map, unit)
    return unit
}

function createUnitEvents(
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.TilemapLayer,
    unit: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    unit.body.onCollide = true // this might be unecessary
    unit.setInteractive()

    unit.on(Phaser.Input.Events.POINTER_UP, () => unitClicked(unit, map, scene))
}
