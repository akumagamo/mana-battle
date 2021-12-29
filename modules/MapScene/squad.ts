import { Force, ForceId } from "../Battlefield/Force"
import { DispatchedSquad, SquadId } from "../Battlefield/Squad"
import { UNIT_DATA_TARGET } from "./events/selectMoveDestination"
import { MapScreen } from "./Model"

export const ARRIVED_AT_TARGET = "Arrived at target"

export const directionKey = (job: string, dir: string) =>
    `${job}-map-walk-${dir}`

export const getSquadJob = (forceId: ForceId) =>
    forceId === "PLAYER" ? "soldier" : "skeleton"

export const createSquad =
    (scene: Phaser.Scene) => (squad: DispatchedSquad, force: Force) => {
        const {
            position: { x, y },
            id,
        } = squad

        const job = getSquadJob(force.id)

        const sprite = scene.physics.add
            .sprite(x, y, `${job}-map`)
            .setDataEnabled()
            .setName(id)
            .play(directionKey(job, "down"))
            .setScale(2)

        createSquadEvents(force.id, squad.id, scene, sprite)

        return sprite
    }

function createSquadEvents(
    forceId: ForceId,
    squadId: SquadId,
    scene: Phaser.Scene,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    sprite.setInteractive()

    const mapScreen = MapScreen(scene)

    sprite.on(Phaser.Input.Events.POINTER_UP, () =>
        mapScreen.events.squadClicked(forceId, squadId)
    )

    sprite.on(ARRIVED_AT_TARGET, () => {
        sprite.data.remove(UNIT_DATA_TARGET)
    })
}

export function updateSquadOrientation(
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    direction: (dir: string) => void
) {
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
