import { State } from "../Battlefield/State"
import create from "./create"
import preload from "./preload"

export default {
    key: "Map Screen",
    create: function (this: Phaser.Scene, props: State) {
        create(this, props)
    },
    preload: function (this: Phaser.Scene) {
        preload(this)
    },
}
