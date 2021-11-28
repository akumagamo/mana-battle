import main from "./main"
import { MapScreenProperties } from "./Model"

export default {
    key: "Map Screen",
    create: function (this: Phaser.Scene, params: MapScreenProperties) {
        main(this, params)
    },
}
