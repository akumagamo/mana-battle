import { fadeOut } from "../../UI/Transition"
import CombatScene from "../../CombatScene/phaser"
import { SquadId } from "../../Battlefield/Squad"

export function listen(scene: Phaser.Scene) {
    scene.events.on("Squad Collision", squadCollision(scene))
}

export const emit =
    (scene: Phaser.Scene) =>
    ([a, b]: [a: SquadId, b: SquadId]) =>
        scene.events.emit("Squad Collision", [a, b])

export const squadCollision =
    (scene: Phaser.Scene) =>
    async ([_a, _b]: [SquadId, SquadId]) => {
        scene.physics.pause()

        await fadeOut(scene, 500)

        scene.scene.add(CombatScene.key, CombatScene)
        scene.scene.start(CombatScene.key)
        scene.scene.remove(scene)
    }
