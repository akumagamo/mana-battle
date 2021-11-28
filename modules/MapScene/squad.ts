import squadClicked from "./events/squadClicked"
import { Squad } from "./Model"
const UNIT_WIDTH = 50
const UNIT_HEIGHT = 100

export const createSquad = (scene: Phaser.Scene) => (squad: Squad) => {
    const { x, y, id } = squad
    const sprite = scene.physics.add
        .sprite(x, y, "squad_test")
        .setDataEnabled()
        .setName(id.get("squad") || "")

    sprite.body.setSize(UNIT_WIDTH, UNIT_HEIGHT)
    createSquadEvents(scene, sprite)
    return sprite
}

function createSquadEvents(
    scene: Phaser.Scene,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    sprite.body.onCollide = true // this might be unecessary
    sprite.setInteractive()

    sprite.on(Phaser.Input.Events.POINTER_UP, () => squadClicked(sprite, scene))
}
