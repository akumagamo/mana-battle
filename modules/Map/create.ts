import { fadeIn } from "../../src/UI/Transition"
import { subscribe, emit } from "./events/_index"

export const create = async (scene: Phaser.Scene) => {
    const emitter = emit(scene)

    subscribe(scene)
    const map = scene.make.tilemap({ key: "maps/map" })
    let tileset = map.addTilesetImage("kenney", "map/kenney_tileset")
    let bg = map.createLayer("bg", [tileset])
    const path = map.createLayer("elevations", [tileset])
    map.createLayer("doodads", [tileset])
    map.setCollisionByProperty({ collides: true })

    scene.cameras.main.setBounds(0, 0, bg.width, bg.height)
    bg.setInteractive()
    scene.input.setDraggable(bg)
    scene.input.dragTimeThreshold = 200
    scene.input.dragDistanceThreshold = 10

    scene.input.on("drag", (pointer: any) => {
        const [deltaX, deltaY] = [
            pointer.prevPosition.x - pointer.x,
            pointer.prevPosition.y - pointer.y,
        ]

        const next = {
            x: scene.cameras.main.scrollX + deltaX,
            y: scene.cameras.main.scrollY + deltaY,
        }

        scene.cameras.main.setScroll(next.x, next.y)
    })
    ;[
        [100, 100],
        [200, 200],
    ].forEach(([x, y]) => {
        const unit = createUnit(x, y, scene, selectMovementForUnit)

        function selectMovementForUnit() {
            console.log(`select target for `, unit)
            selectMovement(unit, path, bg, scene)
        }
    })

    fadeIn(scene, 500)
}

function createUnit(
    x: number,
    y: number,
    scene: Phaser.Scene,
    selectMovementForUnit: () => void
) {
    const unit = scene.physics.add.sprite(x, y, "button")
    unit.setDataEnabled()
    unit.setSize(50, 100)
    unit.setDisplaySize(50, 100)
    unit.body.onCollide = true
    unit.setInteractive()
    unit.on("pointerup", selectMovementForUnit)
    return unit
}

const CLICK_THRESHOLD = 5
function selectMovement(
    unit: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    path: Phaser.Tilemaps.TilemapLayer,
    bg: Phaser.Tilemaps.TilemapLayer,
    scene: Phaser.Scene
) {
    clearEvents()
    function adjustSpeed() {
        const pos = unit.getBottomCenter()
        const tile = path.getTileAtWorldXY(pos.x, pos.y)
        if (tile) {
            const ang = unit.body.angle
            unit.body.setMaxVelocity(tile.properties.speed)
            // if (unit.body.velocity.x !== 0 || unit.body.velocity.y !== 0)
            unit.setVelocity(
                Math.cos(ang) * tile.properties.speed,
                Math.sin(ang) * tile.properties.speed
            )
        }
    }

    bg.on("pointerup", assignMoveOrder)

    function clearEvents() {
        scene.events.off("update", checkArrival)
        scene.physics.world.off(
            Phaser.Physics.Arcade.Events.WORLD_STEP,
            adjustSpeed
        )
        bg.off("pointerup")
    }

    function checkArrival() {
        const target = unit.data.get("target") as Phaser.Math.Vector2
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
        unit.data.set("target", target)
        const tile = path.getTileAtWorldXY(target.x, target.y)
        scene.physics.moveToObject(
            unit,
            { x: pointer.worldX, y: pointer.worldY },
            tile.properties.speed
        )
        scene.events.on("update", checkArrival)
        scene.physics.world.on(
            Phaser.Physics.Arcade.Events.WORLD_STEP,
            adjustSpeed
        )
    }
}
