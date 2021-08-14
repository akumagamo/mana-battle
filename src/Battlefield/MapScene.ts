import { MapState } from "./Model"
import preload from "./preload"
import create from "./create"

export class Battlefield extends Phaser.Scene {
    constructor() {
        super("MapScene")
    }

    preload = preload

    create(state: MapState) {
        create(this, state)
    }
}
