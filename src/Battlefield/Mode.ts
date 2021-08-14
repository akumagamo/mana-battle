import { MapState, Vector } from "./Model"
import { refreshUI } from "./ui"

export type Mode =
    | { type: "NOTHING_SELECTED" }
    | { type: "SQUAD_SELECTED"; id: string }
    | { type: "CITY_SELECTED"; id: string }
    | { type: "SELECT_SQUAD_MOVE_TARGET"; start: Vector; id: string }
    | { type: "CHANGING_SQUAD_FORMATION" }
export const DEFAULT_MODE: Mode = { type: "NOTHING_SELECTED" }

export function changeMode(scene: Phaser.Scene, state: MapState, mode: Mode) {
    state.uiMode = mode
    refreshUI(scene, state)
}
