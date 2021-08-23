import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants"
import button from "../../UI/button"
import panel from "../../UI/panel"
import text from "../../UI/text"
import { disableMapInput } from "../board/input"
import dispatchWindow from "../dispatchWindow"
import OrganizeButtonClicked from "../events/OrganizeButtonClicked"
import { changeMode } from "../Mode"
import { MapState } from "../Model"
import turnOff from "../turnOff"
import city from "./city"
import { squadInfo } from "./squadInfo"

const BOTTOM_PANEL_WIDTH = SCREEN_WIDTH
const BOTTOM_PANEL_HEIGHT = 80
const BOTTOM_PANEL_X = 0
export const BOTTOM_PANEL_Y = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT

export default function ui(
    scene: Phaser.Scene,
    state: MapState
): Promise<void> {
    // TODO: remove scene (currently we fail to select enemy squad without scene)
    // the parent is already removing (refreshUI)
    const baseY = BOTTOM_PANEL_Y + 25
    const { uiContainer } = state

    const btn = (x: number, y: number, label: string, callback: () => void) =>
        button(x, y, label, uiContainer, callback)

    if (state.uiMode.type !== "SELECT_SQUAD_MOVE_TARGET") {
        btn(20, 10, "Organize", () => OrganizeButtonClicked(scene).emit(scene))
        btn(240, 10, "Dispatch", () => {
            disableMapInput(state)
            destroyUI(state)
            dispatchWindow(scene, state)
        })
        btn(SCREEN_WIDTH - 220, 10, "Return to Title", () => {
            turnOff(scene, state)
            scene.scene.start("TitleScene")
        })
    }

    if (state.uiMode.type !== "SELECT_SQUAD_MOVE_TARGET") {
        panel(
            BOTTOM_PANEL_X,
            BOTTOM_PANEL_Y,
            BOTTOM_PANEL_WIDTH,
            BOTTOM_PANEL_HEIGHT,
            uiContainer
        )
        if (state.isPaused)
            btn(SCREEN_WIDTH - 200, SCREEN_HEIGHT - 200, "|> Unpause", () => {
                state.isPaused = false
                refreshUI(scene, state)
            })
        else
            btn(SCREEN_WIDTH - 200, SCREEN_HEIGHT - 200, "|| Pause", () => {
                state.isPaused = true
                refreshUI(scene, state)
            })
    }

    if (state.uiMode.type === "NOTHING_SELECTED") return Promise.resolve()

    switch (state.uiMode.type) {
        case "SQUAD_SELECTED":
            return squadInfo(scene, state, uiContainer, baseY, state.uiMode.id)
        case "CITY_SELECTED":
            return city(state, uiContainer, baseY, state.uiMode.id)
        case "SELECT_SQUAD_MOVE_TARGET":
            return new Promise(() => {
                panel(SCREEN_WIDTH / 2, 15, 220, 50, uiContainer)
                text(
                    SCREEN_WIDTH / 2 + 10,
                    24,
                    "Select Destination",
                    uiContainer
                )
                btn(SCREEN_WIDTH - 200, SCREEN_HEIGHT - 200, "Cancel", () => {
                    if (state.uiMode.type === "SELECT_SQUAD_MOVE_TARGET")
                        changeMode(scene, state, {
                            type: "SQUAD_SELECTED",
                            id: state.uiMode.id,
                        })
                })
            })
        default:
            return Promise.resolve()
    }
}

export async function destroyUI(state: MapState) {
    state.uiContainer.removeAll(true)
}

export async function refreshUI(scene: Phaser.Scene, state: MapState) {
    destroyUI(state)

    if (state.uiMode.type === "CHANGING_SQUAD_FORMATION") return

    ui(scene, state)
}
