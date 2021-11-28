import { adjustSpeed } from "./events/adjustSpeed"
import { checkArrival } from "./events/checkArrival"

const DRAG_TIME_THRESHOLD = 200
const DRAG_DISTANCE_THRESHOLD = 10

export function createMap(scene: Phaser.Scene) {
    const map = scene.make.tilemap({ key: "maps/map" })
    const tileset = map.addTilesetImage("kenney", "map/kenney_tileset")
    map.createLayer("bg", [tileset])
    const layer = map.createLayer("elevations", [tileset])
    map.createLayer("doodads", [tileset])
    map.setCollisionByProperty({ collides: true })

    makeMapDraggable(scene, layer)

    return layer
}

function makeMapDraggable(
    scene: Phaser.Scene,
    layer: Phaser.Tilemaps.TilemapLayer
) {
    scene.cameras.main.setBounds(layer.x, layer.y, layer.width, layer.height)
    layer.setInteractive()
    scene.input.setDraggable(layer)
    scene.input.dragTimeThreshold = DRAG_TIME_THRESHOLD
    scene.input.dragDistanceThreshold = DRAG_DISTANCE_THRESHOLD

    scene.input.on(Phaser.Input.Events.DRAG, (pointer: any) => {
        const deltaX = pointer.prevPosition.x - pointer.x
        const deltaY = pointer.prevPosition.y - pointer.y

        const next = {
            x: scene.cameras.main.scrollX + deltaX,
            y: scene.cameras.main.scrollY + deltaY,
        }

        scene.cameras.main.setScroll(next.x, next.y)
    })

    scene.events.on(Phaser.Scenes.Events.UPDATE, checkArrival(scene))
    scene.events.on(Phaser.Scenes.Events.UPDATE, adjustSpeed(scene, layer))
}
