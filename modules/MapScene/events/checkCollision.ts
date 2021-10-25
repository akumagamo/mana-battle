import { fadeIn } from "../../../src/UI/Transition"
import CombatScene from "../../CombatScene/phaser"
import MapScene from "../phaser"
export default function checkCollision(scene: Phaser.Scene) {
    scene.events.on(Phaser.Scenes.Events.UPDATE, check, scene)
}
function check(this: Phaser.Scene) {
    const scene = this
    const units = scene.data.get(
        "units"
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]

    if (units && units.length > 1)
        scene.physics.overlap([units[0]], [units[1]], () => {
            // for now, just stop the simulation
            // we will trigger the combat event here
            scene.physics.pause()
            scene.events.off(Phaser.Scenes.Events.UPDATE, check)

            fadeIn(scene, 500)

            scene.scene.add(CombatScene.key, CombatScene)
            scene.scene.start(CombatScene.key)
            scene.scene.manager.remove(MapScene.key)
        })
}
