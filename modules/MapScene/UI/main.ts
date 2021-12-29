import { State } from "../../Battlefield/State"
import MapSceneUI from "./phaser"

export default function createUI(
    manager: Phaser.Scenes.SceneManager,
    state: State
) {
    const UI = MapSceneUI(state)
    manager.add(UI.key, UI, true)
}
