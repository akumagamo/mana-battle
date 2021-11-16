import { create } from "./create"

export const key = "Title Screen"

export default {
    key,
    create: function (this: Phaser.Scene) {
        create(this)
    },
}
