import { create } from "./create"
import preload from "./preload"

export const key = "TitleScene"

export default {
    key,
    preload: function(this: Phaser.Scene) {
        preload(this)
    },
    create: function(this: Phaser.Scene) {
        create(this)
    },
}
