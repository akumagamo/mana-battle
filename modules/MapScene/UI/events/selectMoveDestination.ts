import UI from "../../../UI"
import {
    CENTER_X,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from "../../../_shared/constants"
import events from "../../events"
import { MOVE_SQUAD_LABEL, VIEW_SQUAD_DETAILS_LABEL } from "./squadSelected"

const SELECT_DESTINATION_LABEL = "Select Destination"
const CANCEL_OPTION_LABEL = "Cancel"

const SELECT_MOVE_DESTIONATION_OPTIONS = [
    SELECT_DESTINATION_LABEL,
    CANCEL_OPTION_LABEL,
]

export const EVENT_CLOSE_SELET_MOVE_DESTINATION =
    "Close Select Move Destination"

export default (scene: Phaser.Scene) => {
    const actions = [
        deleteOptions,
        renderSelectDestionationLabel,
        renderCancelOption,
    ]

    actions.forEach(listen(scene))

    events(scene).on(EVENT_CLOSE_SELET_MOVE_DESTINATION, () => {
        SELECT_MOVE_DESTIONATION_OPTIONS.forEach((opt) => {
            scene.children.getByName(opt)?.destroy()
        })
    })
}

function listen(scene: Phaser.Scene) {
    return (ev: (scn: Phaser.Scene) => (squad: string) => void) => {
        events(scene).on("Select Move Destination", ev(scene))
    }
}

export function deleteOptions(scene: Phaser.Scene) {
    return (_squad: string) => {
        ;[VIEW_SQUAD_DETAILS_LABEL, MOVE_SQUAD_LABEL]
            .map((name) => scene.children.getByName(name))
            .forEach((el) => el?.destroy())
    }
}
function renderSelectDestionationLabel(scene: Phaser.Scene) {
    return (_squad: string) =>
        UI.text(scene)(CENTER_X, 50, SELECT_DESTINATION_LABEL)
}

function renderCancelOption(scene: Phaser.Scene) {
    return (squad: string) =>
        UI.button(scene)(
            SCREEN_WIDTH - 150,
            SCREEN_HEIGHT - 60,
            CANCEL_OPTION_LABEL,
            () => events(scene).emit("Move Squad Cancelled", squad)
        )
}
