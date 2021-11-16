import { create } from "./create"
import {MapScreenProperties} from "./Model"

export default {
    key: "Map Screen",
    create: function (this: Phaser.Scene, params:MapScreenProperties) {
        create(this, params)
    },
}
