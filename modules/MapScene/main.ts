import { State } from "../Battlefield/State"
import phaser from "./phaser"

export default async (manager: Phaser.Scenes.SceneManager, state: State) => {
    manager.add(phaser.key, phaser, true, state)
}
