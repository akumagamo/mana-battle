import { UNIT_DATA_TARGET } from "./events/selectMoveDestination"
import squadClicked from "./events/squadClicked"
import { Squad } from "./Model"

export const ARRIVED_AT_TARGET = "Arrived at target"

export const createSquad = (scene: Phaser.Scene) => (squad: Squad) => {
    const { x, y, id } = squad

    const sprite = scene.physics.add
        .sprite(x, y, "soldier-map")
        .setDataEnabled()
        .setName(id.get("squad") || "")
        .play("map-walk-down")
        .setScale(2)

    createSquadEvents(scene, sprite)
    return sprite
}

function createSquadEvents(
    scene: Phaser.Scene,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    sprite.setInteractive()

    sprite.on(Phaser.Input.Events.POINTER_UP, () => squadClicked(sprite, scene))

    sprite.on(ARRIVED_AT_TARGET, () => {
        sprite.data.remove(UNIT_DATA_TARGET)
    })
}
