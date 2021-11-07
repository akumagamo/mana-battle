import CombatScene from "../../CombatScene/phaser"
import { fadeOut } from "../../UI/Transition"
import MapScreen from "../phaser"
export default function checkCollision(scene: Phaser.Scene) {
    scene.events.on(Phaser.Scenes.Events.UPDATE, check, scene)
}
function check(this: Phaser.Scene) {
    const scene = this
    const units = scene.data.get(
        "Map Screen Squads"
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]

    scene.physics.overlap([units[0]], [units[1]], async () => {
        scene.physics.pause()
        scene.events.off(Phaser.Scenes.Events.UPDATE, check)

        await fadeOut(scene, 500)

        scene.scene.add(CombatScene.key, CombatScene)
        scene.scene.start(CombatScene.key)
        scene.scene.remove(MapScreen.key)
    })
}
