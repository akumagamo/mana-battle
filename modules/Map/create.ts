import { fadeIn } from "../../src/UI/Transition"
import { subscribe, emit } from "./events/_index"

export const create = async (scene: Phaser.Scene) => {
    const emitter = emit(scene)

    subscribe(scene)
    const map = scene.make.tilemap({ key: "maps/map" })
    let tileset = map.addTilesetImage("kenney", "map/kenney_tileset")
    let bg = map.createLayer("bg", [tileset])
    map.createLayer("elevations", [tileset])
    map.createLayer("doodads", [tileset])

    //    state.layer = bg

    scene.cameras.main.setBounds(0, 0, bg.width, bg.height)

    //check dragDistanceThreshold
    bg.setInteractive()
    scene.input.setDraggable(bg)

    scene.input.on("drag", (pointer: any) => {
        const [dx, dy] = [
            pointer.prevPosition.x - pointer.x,
            pointer.prevPosition.y - pointer.y,
        ]

        const next = {
            x: scene.cameras.main.scrollX + dx,
            y: scene.cameras.main.scrollY + dy,
        }

        scene.cameras.main.setScroll(next.x, next.y)
    })

    fadeIn(scene, 500)
}
