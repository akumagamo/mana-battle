import UI from "../../../UI"
import { SCREEN_HEIGHT } from "../../../_shared/constants"
import events from "../../events"
import { getSquad, isAllied, State } from "../../Model"
import createSquadDetailsModal from "../squadDetailsModal"
import { deleteOptions } from "./selectMoveDestination"

export const VIEW_SQUAD_DETAILS_LABEL = "View Squad Details"
export const MOVE_SQUAD_LABEL = "Move Squad"

export function squadSelected(scene: Phaser.Scene, state: State) {
    return (squadId: string) => {
        deleteOptions(scene)(squadId)

        UI.button(scene)(
            200,
            SCREEN_HEIGHT - 50,
            VIEW_SQUAD_DETAILS_LABEL,
            createSquadDetailsModal(scene)
        )

        if (isAllied(getSquad(squadId)(state))) {
            UI.button(scene)(500, SCREEN_HEIGHT - 50, MOVE_SQUAD_LABEL, () => {
                events(scene).emit("Select Move Destination", squadId)
            })
        }
    }
}
