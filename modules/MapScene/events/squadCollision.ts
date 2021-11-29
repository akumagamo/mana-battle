import { fadeOut } from "../../UI/Transition"
import CombatScene from "../../CombatScene/phaser"

export function squadCollision(scene: Phaser.Scene) {
    return async ([_idA, _idB]: [string, string]) => {
        scene.physics.pause()

        await fadeOut(scene, 500)

        scene.scene.add(CombatScene.key, CombatScene)
        scene.scene.start(CombatScene.key)
        scene.scene.remove(scene)
    }
}
