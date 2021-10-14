import { MapState } from "../Model"

export default (scene: Phaser.Scene, state: MapState) => {
    const map = scene.make.tilemap({ key: "maps/map" })
    let tileset = map.addTilesetImage("kenney", "map/kenney_tileset")
    let bg = map.createLayer("bg", [tileset])
    map.createLayer("elevations", [tileset])
    map.createLayer("doodads", [tileset])

    state.layer = bg

    scene.cameras.main.setBounds(0, 0, bg.width, bg.height)
    let cities = map.createFromObjects("cities", { key: "tiles/town" })

    cities.forEach((c) => {
        //@ts-ignore
        c.setScale(0.5)
    })

    cities.forEach((c) => {
        c.setInteractive()
        c.on("pointerdown", () => {
            console.log(c)
        })
    })
}
