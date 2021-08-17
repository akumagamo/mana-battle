import { getDistance } from "../../utils"
import { cellToScreenPosition } from "../board/position"
import { MOVE_SPEED } from "../config"
import finishMovement from "./finishMovement"
import stepChara from "./stepChara"
import { getChara, getMapSquad, MapState } from "../Model"
import { checkCollision } from "./checkCollision"
import startCombat from "../squads/startCombat"
import { getUnitSquad } from "../../Squad/Model"
import { Map } from "immutable"

export default function (scene: Phaser.Scene, state: MapState) {
    const movedSquads = state.squadsInMovement.keySeq()

    state.squadsInMovement.forEach(async (value, squadId) => {
        const { path, squad } = value

        const [head] = path

        const next = cellToScreenPosition(head)

        const dist = getDistance(squad.posScreen, next)

        const chara = getChara(state, squadId)

        if (dist >= MOVE_SPEED) {
            stepChara(state, next, squad, chara)
        } else {
            await finishMovement(scene, state, path, squad)
        }
    })

    // TODO: divide by each squad, store lists of enemies then compare
    movedSquads.find((id) => {
        const collided = checkCollision(state)(id)

        if (collided) {
            const squad = getUnitSquad(
                collided.id,
                state.squads.map((s) => s.squad),
                state.unitSquadIndex
            )
            startCombat(
                scene,
                state,
                Map({
                    [id]: getMapSquad(state, id).squad,
                    [squad.id]: getMapSquad(state, squad.id).squad,
                })
            )
            return true
        } else return false
    })
}
