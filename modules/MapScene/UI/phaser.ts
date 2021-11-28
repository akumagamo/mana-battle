import { State } from "../Model"
import create from "./create"

export default (state: State) => ({
    key: "Map Screen UI",
    create: function (this: Phaser.Scene) {
        create(this, state)
    },
})
