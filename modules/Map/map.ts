import { DRAG_TIME_THRESHOLD, DRAG_DISTANCE_THRESHOLD } from "./create"

export function renderMap(scene: Phaser.Scene) {
    const map = scene.make.tilemap({ key: "maps/map" })
    const tileset = map.addTilesetImage("kenney", "map/kenney_tileset")
    map.createLayer("bg", [tileset])
    const layer = map.createLayer("elevations", [tileset])
    map.createLayer("doodads", [tileset])
    map.setCollisionByProperty({ collides: true })

    makeMapDraggable(scene, layer)

    return layer
}
export function makeMapDraggable(
    scene: Phaser.Scene,
    layer: Phaser.Tilemaps.TilemapLayer
) {
    scene.cameras.main.setBounds(layer.x, layer.y, layer.width, layer.height)
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
