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

    //    state.layer = bg

    scene.cameras.main.setBounds(0, 0, bg.width, bg.height)

    //check dragDistanceThreshold
    bg.setInteractive()
    scene.input.setDraggable(bg)

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

    const unit = scene.physics.add.sprite(100, 100, "button")
    unit.setSize(50, 100)
    unit.setDisplaySize(50, 100)
    unit.body.onCollide = true

    //scene.cameras.main.startFollow(unit)

    const adjustSpeed = () => {
        const pos = unit.getBottomCenter()
        const tile = path.getTileAtWorldXY(pos.x, pos.y)
        if (tile) {
            const ang = unit.body.angle
            //console.log(Math.cos(ang), Math.sin(ang))
            unit.body.setMaxVelocity(tile.properties.speed)
            // if (unit.body.velocity.x !== 0 || unit.body.velocity.y !== 0)
            unit.setVelocity(
                Math.cos(ang) * tile.properties.speed,
                Math.sin(ang) * tile.properties.speed
            )
        }
    }

    let target: { x: number; y: number }

    bg.on("pointerup", assignMoveOrder)
    let distance = 0

    function checkArrival() {
        distance = Phaser.Math.Distance.BetweenPoints(unit, target)

        if (distance <= 4) {
            unit.body.reset(target.x, target.y)
            unit.body.velocity.reset()
            scene.events.off("update", checkArrival)
            scene.physics.world.off(
                Phaser.Physics.Arcade.Events.WORLD_STEP,
                adjustSpeed
            )
        }
    }
    function assignMoveOrder(pointer: Phaser.Input.Pointer) {
        scene.events.off("update", checkArrival)
        scene.physics.world.off(
            Phaser.Physics.Arcade.Events.WORLD_STEP,
            adjustSpeed
        )
        console.log(`click!`, pointer)

        target = { x: pointer.worldX * 1, y: pointer.worldY * 1 }

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

    fadeIn(scene, 500)
}
