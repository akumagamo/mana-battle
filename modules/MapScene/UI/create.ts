import UI from "../../UI"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../_shared/constants"
import { getState, getSquad, isAllied } from "../Model"
import createSquadDetailsModal from "./squadDetailsModal"

const BG_TEXTURE = "panel"
const PANEL_HEIGHT = 100

const VIEW_SQUAD_DETAILS_LABEL = "View Squad Details"
const MOVE_SQUAD_LABEL = "Move Squad"

export const create = async (scene: Phaser.Scene) => {
    scene.add
        .image(0, SCREEN_HEIGHT - PANEL_HEIGHT, BG_TEXTURE)
        .setDisplaySize(SCREEN_WIDTH, PANEL_HEIGHT)
        .setSize(SCREEN_WIDTH, PANEL_HEIGHT)

    scene.game.events.emit("Map Screen UI Created")

    scene.events.on("Squad Selected", (squadId: string) => {
        UI.button(scene)(
            100,
            SCREEN_HEIGHT - 50,
            VIEW_SQUAD_DETAILS_LABEL,
            () => {
                createSquadDetailsModal(scene)
            }
        )

        if (isAllied(getSquad(squadId)(getState(scene)))) {
            UI.button(scene)(250, SCREEN_HEIGHT - 50, MOVE_SQUAD_LABEL, () => {
                console.log("choose desired move location", squadId)
            })
        }
    })
}
