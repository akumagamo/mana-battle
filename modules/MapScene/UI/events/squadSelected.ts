import { ForceControllers, ForceId } from "../../../Battlefield/Force"
import { SquadId } from "../../../Battlefield/Squad"
import { State } from "../../../Battlefield/State"
import UI from "../../../UI"
import { SCREEN_HEIGHT } from "../../../_shared/constants"
import events from "../../events"
import createSquadDetailsModal from "../squadDetailsModal"
import { SELECTED_SQUAD_OPTIONS } from "./selectMoveDestination"

export const VIEW_SQUAD_DETAILS_LABEL = "View Squad Details"
export const MOVE_SQUAD_LABEL = "Move Squad"

export function squadSelected(scene: Phaser.Scene, state: State) {
    return (forceId: ForceId, squadId: SquadId) => {
        SELECTED_SQUAD_OPTIONS.forEach((opt) =>
            scene.children.getByName(opt)?.destroy()
        )
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
            UI.button(scene)(500, SCREEN_HEIGHT - 50, MOVE_SQUAD_LABEL, () => {
                events(scene).emit("Select Move Destination", forceId, squad.id)
            })
        }
    }
}
