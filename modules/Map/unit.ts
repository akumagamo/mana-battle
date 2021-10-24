const UNIT_WIDTH = 50
const UNIT_HEIGHT = 100
const UNIT_DATA_TARGET = "target"
const CLICK_THRESHOLD = 5

export function renderUnit(
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.TilemapLayer,
    x: number,
    y: number
) {
    const unit = scene.physics.add.sprite(x, y, "button")
    unit.setDataEnabled()
    unit.setSize(UNIT_WIDTH, UNIT_HEIGHT)
    unit.setDisplaySize(UNIT_WIDTH, UNIT_HEIGHT)
    createUnitEvents(scene, map, unit)
    return unit
}

export function createUnitEvents(
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.TilemapLayer,
    unit: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    unit.body.onCollide = true
    unit.setInteractive()
    unit.on(Phaser.Input.Events.POINTER_UP, selectMovementForUnit)
    function selectMovementForUnit() {
        selectMovement(unit, map, scene)
    }
}

function selectMovement(
    unit: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    layer: Phaser.Tilemaps.TilemapLayer,
    scene: Phaser.Scene
) {
    clearEvents()
    layer.on(Phaser.Input.Events.POINTER_UP, assignMoveOrder)

    function adjustSpeed() {
        const pos = unit.getBottomCenter()
        const tile = layer.getTileAtWorldXY(pos.x, pos.y)
        if (tile) {
            const ang = unit.body.angle
            unit.setVelocity(
                Math.cos(ang) * tile.properties.speed,
                Math.sin(ang) * tile.properties.speed
            )
        }
    }

    function clearEvents() {
        scene.events.off(Phaser.Scenes.Events.UPDATE, checkArrival)
        scene.physics.world.off(
            Phaser.Physics.Arcade.Events.WORLD_STEP,
            adjustSpeed
        )
        layer.off(Phaser.Input.Events.POINTER_UP)
    }

    function checkArrival() {
        const target = unit.data.get(UNIT_DATA_TARGET) as Phaser.Math.Vector2
        const distance = Phaser.Math.Distance.BetweenPoints(unit, target)

        if (distance <= 10) {
            unit.body.velocity.reset()
            clearEvents()
        }
    }
    function assignMoveOrder(pointer: Phaser.Input.Pointer) {
        const userDraggedInsteadOfClicking =
            Phaser.Math.Distance.Between(
                pointer.upX,
                pointer.upY,
                pointer.downX,
                pointer.downY
            ) > CLICK_THRESHOLD
        if (userDraggedInsteadOfClicking) return

        clearEvents()

        const target = { x: pointer.worldX, y: pointer.worldY }
        unit.data.set(UNIT_DATA_TARGET, target)
        const tile = layer.getTileAtWorldXY(target.x, target.y)
        scene.physics.moveToObject(
            unit,
            { x: pointer.worldX, y: pointer.worldY },
            tile.properties.speed
        )
        scene.events.on(Phaser.Scenes.Events.UPDATE, checkArrival)
        scene.physics.world.on(
            Phaser.Physics.Arcade.Events.WORLD_STEP,
            adjustSpeed
        )
    }
}
