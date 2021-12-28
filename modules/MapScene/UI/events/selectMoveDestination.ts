import { ForceId } from "../../../Battlefield/Force"
import { SquadId } from "../../../Battlefield/Squad"
import UI from "../../../UI"
import {
    CENTER_X,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from "../../../_shared/constants"
import events from "../../events"
import selectMoveDestination from "../../events/selectMoveDestination"
import { MOVE_SQUAD_LABEL, VIEW_SQUAD_DETAILS_LABEL } from "./squadSelected"

const SELECT_DESTINATION_LABEL = "Select Destination"
const CANCEL_OPTION_LABEL = "Cancel"

const SELECT_MOVE_DESTIONATION_OPTIONS = [
    SELECT_DESTINATION_LABEL,
    CANCEL_OPTION_LABEL,
]

export const EVENT_CLOSE_SELET_MOVE_DESTINATION =
    "Close Select Move Destination"

export default (scene: Phaser.Scene, forceId: ForceId, squadId: SquadId) => {
    const actions = [
        disableOptions,
        renderSelectDestionationLabel,
        renderCancelOption,
    ]

    actions.forEach((action) => action(scene)(squadId, forceId))

    events(scene).on(EVENT_CLOSE_SELET_MOVE_DESTINATION, () => {
        SELECT_MOVE_DESTIONATION_OPTIONS.forEach((opt) => {
            scene.children.getByName(opt)?.destroy()
        })
    })

    selectMoveDestination(forceId, squadId, scene)
}

export const SELECTED_SQUAD_OPTIONS = [
    VIEW_SQUAD_DETAILS_LABEL,
    MOVE_SQUAD_LABEL,
]
export function disableOptions(scene: Phaser.Scene) {
    return (_squad: SquadId, _forceId: ForceId) => {
        const elements = SELECTED_SQUAD_OPTIONS.map((name) =>
            scene.children.getByName(name)
        ) as Phaser.GameObjects.Container[]
        elements.forEach((el) => el.destroy())
    }
}
function renderSelectDestionationLabel(scene: Phaser.Scene) {
    return (_squad: SquadId, _forceId: ForceId) =>
        UI.text(scene)(CENTER_X, 50, SELECT_DESTINATION_LABEL)
}

function renderCancelOption(scene: Phaser.Scene) {
    return (squad: SquadId, force: ForceId) =>
        UI.button(scene)(
            SCREEN_WIDTH - 150,
            SCREEN_HEIGHT - 60,
            CANCEL_OPTION_LABEL,
            () => events(scene).emit("Move Squad Cancelled", force, squad)
        )
}
