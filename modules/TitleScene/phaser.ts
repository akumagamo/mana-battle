import { create } from "./create"
import preload from "./preload"

export const key = "Title Screen"

export default {
    key,
    preload: function (this: Phaser.Scene) {
        preload(this)
    },
    create: function (this: Phaser.Scene) {
        create(this)
    },
}
