import { fadeOut } from "../../UI/Transition"
import CombatScene from "../../CombatScene/phaser"
import { SquadId } from "../../Battlefield/Squad"

export default (scene: Phaser.Scene) =>
    async ([_a, _b]: [SquadId, SquadId]) => {
        scene.physics.pause()

        await fadeOut(scene, 500)

        scene.scene.add(CombatScene.key, CombatScene)
        scene.scene.start(CombatScene.key)
        scene.scene.remove(scene)
    }
