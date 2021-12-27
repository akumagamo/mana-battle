import { State } from "../../Battlefield/State"
import MapSceneUI from "./phaser"

export default function createUI(scene: Phaser.Scene, state: State) {
    const UI = MapSceneUI(state)
    scene.scene.add(UI.key, UI, true)
}
