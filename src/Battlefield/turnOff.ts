import { DEFAULT_MODE } from "./Mode"
import { MapState } from "./Model"

export default function (scene: Phaser.Scene, state: MapState) {
    state.mapContainer.destroy()
    state.uiContainer.destroy()
    state.charas.forEach((chara) => chara.destroy())
    state.charas = []
    state.tiles.forEach((tile) => {
        tile.tile.destroy()
    })
    state.tiles = []
    state.tileIndex = [[]]
    state.citySprites.forEach((city) => city.container.destroy())
    state.citySprites = []

    state.uiMode = DEFAULT_MODE

    scene.scene.manager.stop("MapScene")

    scene.events.removeAllListeners()
}
