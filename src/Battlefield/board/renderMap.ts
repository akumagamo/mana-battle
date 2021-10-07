import { MapState } from "../Model"

export default (scene: Phaser.Scene, state: MapState) => {
    const { mapContainer } = state

    const map = scene.make.tilemap({ key: "maps/map1" })
    var tileset1 = map.addTilesetImage("World Tileset", "tiles/tiles")
    var layer1 = map.createLayer("Tile Layer 1", [tileset1])

    state.layer = layer1

    var cities = map.createFromObjects("Cities", { key: "tiles/town" })

    cities.forEach((c) => {
        //@ts-ignore
        c.setScale(0.5)

        ////@ts-ignore
        //const x = c.x - c.y

        ////@ts-ignore
        //const y = (c.x + x.y) / 2

        ////@ts-ignore
        //c.x = x

        ////@ts-ignore
        //c.y = y
    })

    cities.forEach((c) => {
        c.setInteractive()
        c.on("pointerdown", () => {
            console.log(c)
        })
    })

    mapContainer.add(layer1)
    mapContainer.add(cities)
}
