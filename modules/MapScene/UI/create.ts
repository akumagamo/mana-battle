import {squadSelected} from "./events/squadSelected"

export const create = async (scene: Phaser.Scene) => {
    scene.game.events.emit("Map Screen UI Created")

    scene.events.on("Squad Selected", squadSelected(scene))
}
