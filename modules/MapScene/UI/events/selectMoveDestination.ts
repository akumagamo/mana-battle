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

export default (scene: Phaser.Scene, forceId: ForceId, squadId: SquadId) => {
    const actions = [
        destroyOptions,
        renderSelectDestionationLabel,
        renderCancelOption,
    ]

    actions.forEach((action) => action(scene)(squadId, forceId))

    selectMoveDestination(forceId, squadId, scene)
}

export const closeSelectMoveDestination = (scene: Phaser.Scene) => () => {
    SELECT_MOVE_DESTIONATION_OPTIONS.forEach((opt) => {
        const child = scene.children.getByName(opt)
        if (!child) {
            console.error(
                `Element "${opt}" not available on`,
                scene.children.list.map((c) => c.name)
            )
            return
        }
        child.destroy()
    })
}

export function destroyOptions(scene: Phaser.Scene) {
    return () => {
        const SELECTED_SQUAD_OPTIONS = [
            VIEW_SQUAD_DETAILS_LABEL,
            MOVE_SQUAD_LABEL,
        ]
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
