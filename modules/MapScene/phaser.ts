import main from "./main"
import { MapScreenProperties } from "./Model"
import preload from "./preload"

export default {
    key: "Map Screen",
    create: function (this: Phaser.Scene, params: MapScreenProperties) {
        main(this, params)
    },
    preload: function (this: Phaser.Scene) {
        preload(this)
    },
}
