import { create } from "./create"

export const key = "CombatScene"

export default {
    key,
    create: function (this: Phaser.Scene, units: []) {
        create(this, units)
    },
}
