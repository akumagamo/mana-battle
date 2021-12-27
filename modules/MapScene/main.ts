import { State } from "../Battlefield/State"
import phaser from "./phaser"

export default async (scene: Phaser.Scene, state: State) => {
    scene.game.scene.add(phaser.key, phaser, true, state)
}
