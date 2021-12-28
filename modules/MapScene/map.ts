import { adjustSpeed } from "./events/adjustSpeed"
import { checkArrival } from "./events/checkArrival"

const DRAG_TIME_THRESHOLD = 200
const DRAG_DISTANCE_THRESHOLD = 10

export function createMap(scene: Phaser.Scene) {
    const map = scene.make.tilemap({ key: "maps/map" })
    const tileset = map.addTilesetImage("pipo")
    const layer = map.createLayer("bg", [tileset])

    layer.name = "bg"
    map.createLayer("elevations", [tileset])
    map.createLayer("doodads", [tileset])

    map.setCollisionByProperty({ collides: true })

    makeMapDraggable(scene, layer)

    return layer
}

function makeMapDraggable(
    scene: Phaser.Scene,
    layer: Phaser.Tilemaps.TilemapLayer
) {
    const { input, cameras, events } = scene

    cameras.main.setBounds(layer.x, layer.y, layer.width, layer.height)
    layer.setInteractive()
    input.setDraggable(layer)
    input.dragTimeThreshold = DRAG_TIME_THRESHOLD
    input.dragDistanceThreshold = DRAG_DISTANCE_THRESHOLD

    input.on(Phaser.Input.Events.DRAG, (pointer: any) => {
        const deltaX = pointer.prevPosition.x - pointer.x
        const deltaY = pointer.prevPosition.y - pointer.y

        const next = {
            x: cameras.main.scrollX + deltaX,
            y: cameras.main.scrollY + deltaY,
        }

        cameras.main.setScroll(next.x, next.y)
    })

    events.on(Phaser.Scenes.Events.UPDATE, checkArrival(scene))
    events.on(Phaser.Scenes.Events.UPDATE, adjustSpeed(scene, layer))
}
