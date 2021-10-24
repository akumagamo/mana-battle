import { fadeIn } from "../../src/UI/Transition"
import { subscribe } from "./events/_index"

const coords = [
    [100, 100],
    [200, 200],
]

const CLICK_THRESHOLD = 5
const UNIT_WIDTH = 50
const UNIT_HEIGHT = 100
const DRAG_TIME_THRESHOLD = 200
const DRAG_DISTANCE_THRESHOLD = 10

export const create = async (scene: Phaser.Scene) => {
    subscribe(scene)

    const map = renderMap(scene)

    makeMapDraggable(scene, map)

    coords.forEach(([x, y]) => {
        renderUnit(scene, map, x, y)
    })

    fadeIn(scene, 500)
}

function renderMap(scene: Phaser.Scene) {
    const map = scene.make.tilemap({ key: "maps/map" })
    const tileset = map.addTilesetImage("kenney", "map/kenney_tileset")
    map.createLayer("bg", [tileset])
    const layer = map.createLayer("elevations", [tileset])
    map.createLayer("doodads", [tileset])
    map.setCollisionByProperty({ collides: true })
    return layer
}

function renderUnit(
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.TilemapLayer,
    x: number,
    y: number
) {
    function selectMovementForUnit() {
        console.log(`select target for `, unit)
        selectMovement(unit, map, scene)
    }
    const unit = scene.physics.add.sprite(x, y, "button")
    unit.setDataEnabled()
    unit.setSize(UNIT_WIDTH, UNIT_HEIGHT)
    unit.setDisplaySize(UNIT_WIDTH, UNIT_HEIGHT)
    unit.body.onCollide = true
    unit.setInteractive()
    unit.on("pointerup", selectMovementForUnit)
    return unit
}

function makeMapDraggable(
    scene: Phaser.Scene,
    layer: Phaser.Tilemaps.TilemapLayer
) {
    scene.cameras.main.setBounds(0, 0, layer.width, layer.height)
    layer.setInteractive()
    scene.input.setDraggable(layer)
    scene.input.dragTimeThreshold = DRAG_TIME_THRESHOLD
    scene.input.dragDistanceThreshold = DRAG_DISTANCE_THRESHOLD

    scene.input.on("drag", (pointer: any) => {
        const deltaX = pointer.prevPosition.x - pointer.x
        const deltaY = pointer.prevPosition.y - pointer.y

        const next = {
            x: scene.cameras.main.scrollX + deltaX,
            y: scene.cameras.main.scrollY + deltaY,
        }

        scene.cameras.main.setScroll(next.x, next.y)
    })
}

function selectMovement(
    unit: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    layer: Phaser.Tilemaps.TilemapLayer,
    scene: Phaser.Scene
) {
    clearEvents()
    layer.on("pointerup", assignMoveOrder)

    function adjustSpeed() {
        const pos = unit.getBottomCenter()
        const tile = layer.getTileAtWorldXY(pos.x, pos.y)
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

    function clearEvents() {
        scene.events.off("update", checkArrival)
        scene.physics.world.off(
            Phaser.Physics.Arcade.Events.WORLD_STEP,
            adjustSpeed
        )
        layer.off("pointerup")
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
        const tile = layer.getTileAtWorldXY(target.x, target.y)
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
