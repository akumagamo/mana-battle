import { MapState } from "../Model"

export default (scene: Phaser.Scene, state: MapState) => {
    const { mapContainer } = state

    const map = scene.make.tilemap({ key: "maps/map1" })
    var tileset1 = map.addTilesetImage("World Tileset", "tiles/tiles")
    var layer1 = map.createLayer("Tile Layer 1", [tileset1])

    var cities = map.createFromObjects("Cities", { key: "tiles/town" })

    //@ts-ignore
    cities.forEach((c) => c.setScale(0.5))

    cities.forEach((c) => {
        //@ts-ignore
        c.setTint(0xff88aa)

        //@ts-ignore
        c.setPosition(c.x - 128, c.y + 24 )
    })

    mapContainer.add(layer1)
    mapContainer.add(cities)
}
