import { ForceControllers, ForceId } from "../../../Battlefield/Force"
import { SquadId } from "../../../Battlefield/Squad"
import UI from "../../../UI"
import { SCREEN_HEIGHT } from "../../../_shared/constants"
import { MapScreen } from "../../Model"
import createSquadDetailsModal from "../squadDetailsModal"
import selectMoveDestination from "./selectMoveDestination"

export const VIEW_SQUAD_DETAILS_LABEL = "View Squad Details"
export const MOVE_SQUAD_LABEL = "Move Squad"

export default (scene: Phaser.Scene) => {
    return (forceId: ForceId, squadId: SquadId) => {
        const { getState } = MapScreen(scene)
        const state = getState()

        UI.button(scene)(
            200,
            SCREEN_HEIGHT - 50,
            VIEW_SQUAD_DETAILS_LABEL,
            createSquadDetailsModal(scene)
        )

        const force = state.forces.get(forceId)
        if (!force) throw new Error()
        const squad = force.dispatchedSquads.get(squadId)
        if (!squad) throw new Error()

        if (force.controller === ForceControllers.PLAYER) {
            UI.button(scene)(500, SCREEN_HEIGHT - 50, MOVE_SQUAD_LABEL, () =>
                selectMoveDestination(scene, forceId, squadId)
            )
        }
    }
}
