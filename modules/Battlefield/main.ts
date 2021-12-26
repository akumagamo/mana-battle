import createUI from "../MapScene/UI/main"
import createMapScreen from "../MapScene/main"
import { State } from "./State"

export const main = (scene: Phaser.Scene, mapId: string) => {
    return {
        start: () => {
            const state = getMap(mapId)
            createMapScreen(scene, state)
            createUI(scene)
        },
        destroy: () => {
            //something like
            //scene.scene.remove('MapScreen')
            //scene.scene.remove('MapScreenUI')
            //or even better
            //destroyMapScreen(scene)
            //destroyMapScreenUI(scene)
        },
    }
}
