import { Force, ForceId } from "../Battlefield/Force"
import { DispatchedSquad, SquadId } from "../Battlefield/Squad"
import { UNIT_DATA_TARGET } from "./events/selectMoveDestination"
import squadClicked from "./events/squadClicked"
import { MapScreen } from "./Model"

export const ARRIVED_AT_TARGET = "Arrived at target"

export const createSquad =
    (scene: Phaser.Scene) => (squad: DispatchedSquad, force: Force) => {
        const {
            position: { x, y },
            id,
        } = squad

        const directionKey = (dir: string) => `${job}-map-walk-${dir}`

        const job = force.id === "PLAYER" ? "soldier" : "skeleton"
        const sprite = scene.physics.add
            .sprite(x, y, `${job}-map`)
            .setDataEnabled()
            .setName(id)
            .play(directionKey("down"))
            .setScale(2)

        createSquadEvents(force.id, squad.id, scene, sprite)

        sprite.on(
            "updateAnimation",
            updateSquadOrientation(sprite, (dir) => {
                sprite.anims.play(directionKey(dir))
            })
        )
        return sprite
    }

function createSquadEvents(
    forceId: ForceId,
    squadId: SquadId,
    scene: Phaser.Scene,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    sprite.setInteractive()

    const mapScreen = MapScreen(scene.scene.manager)

    sprite.on(Phaser.Input.Events.POINTER_UP, () =>
        mapScreen.events.squadClicked(forceId, squadId, sprite)
    )

    sprite.on(ARRIVED_AT_TARGET, () => {
        sprite.data.remove(UNIT_DATA_TARGET)
    })
}

function updateSquadOrientation(
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    direction: (dir: string) => void
) {
    return () => {
        const { x, y } = sprite.body.velocity

        const absX = Math.abs(x)
        const absY = Math.abs(y)

        if (absX > absY) {
            if (x > 0) direction("right")
            else direction("left")
        } else {
            if (y > 0) direction("down")
            else direction("top")
        }
    }
}
