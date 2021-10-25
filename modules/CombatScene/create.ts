import { fadeIn } from "../../src/UI/Transition"
import text from "../UI/text"
import MapScene from "../MapScene/phaser"
import CombatScene from "./phaser"

// IDEA: inject UI module to reduce coupling
export const create = async (scene: Phaser.Scene, units: []) => {
    const t_ = text(scene)(200, 200, "hello").setColor("#fff")
    t_.setInteractive()
    t_.on("pointerdown", () => {
        // TODO: have interfaces that accept value objects instead of strings
        scene.scene.add(MapScene.key, MapScene)
        scene.scene.start(MapScene.key)
        scene.scene.remove(CombatScene.key)
    })
    await fadeIn(scene, 500)
}
