import { create } from "./create"
import preload from "./preload"

export const key = "CombatScene"

export default {
    key,
    create: function (this: Phaser.Scene) {
        create(this)
    },
    preload: function (this: Phaser.Scene) {
        preload(this)
    },
}
