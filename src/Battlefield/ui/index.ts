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

    if (state.uiMode.type !== "SELECT_SQUAD_MOVE_TARGET") {
        button(20, 10, "Organize", uiContainer, scene, () =>
            OrganizeButtonClicked(scene).emit(scene)
        )
        button(240, 10, "Dispatch", uiContainer, scene, () => {
            disableMapInput(state)
            destroyUI(state)
            state.isPaused = true
            dispatchWindow(scene, state)
        })

        button(
            SCREEN_WIDTH - 220,
            10,
            "Return to Title",
            uiContainer,
            scene,
            () => {
                turnOff(scene, state)
                scene.scene.start("TitleScene")
            }
        )
    }

    if (state.uiMode.type !== "SELECT_SQUAD_MOVE_TARGET") {
        panel(
            BOTTOM_PANEL_X,
            BOTTOM_PANEL_Y,
            BOTTOM_PANEL_WIDTH,
            BOTTOM_PANEL_HEIGHT,
            uiContainer,
            scene
        )
        if (state.isPaused)
            button(
                SCREEN_WIDTH - 200,
                SCREEN_HEIGHT - 200,
                "|> Unpause",
                uiContainer,
                scene,
                () => {
                    state.isPaused = false
                    refreshUI(scene, state)
                }
            )
        else
            button(
                SCREEN_WIDTH - 200,
                SCREEN_HEIGHT - 200,
                "|| Pause",
                uiContainer,
                scene,
                () => {
                    state.isPaused = true
                    refreshUI(scene, state)
                }
            )
    }

    if (state.uiMode.type === "NOTHING_SELECTED") return Promise.resolve()

    switch (state.uiMode.type) {
        case "SQUAD_SELECTED":
            return squadInfo(scene, state, uiContainer, baseY, state.uiMode.id)
        case "CITY_SELECTED":
            return city(scene, state, uiContainer, baseY, state.uiMode.id)
        case "SELECT_SQUAD_MOVE_TARGET":
            return new Promise(() => {
                panel(SCREEN_WIDTH / 2, 15, 220, 50, uiContainer, scene)
                text(
                    SCREEN_WIDTH / 2 + 10,
                    24,
                    "Select Destination",
                    uiContainer,
                    scene
                )
                button(
                    SCREEN_WIDTH - 200,
                    SCREEN_HEIGHT - 200,
                    "Cancel",
                    uiContainer,
                    scene,
                    () => {
                        if (state.uiMode.type === "SELECT_SQUAD_MOVE_TARGET")
                            changeMode(scene, state, {
                                type: "SQUAD_SELECTED",
                                id: state.uiMode.id,
                            })
                    }
                )
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
