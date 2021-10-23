import { create } from "./create"
import preload from "./preload"

export default {
    key: "TitleScene",
    preload: function(this: Phaser.Scene) {
        preload(this)
    },
    create: function(this: Phaser.Scene) {
        create(this)
    },
}
