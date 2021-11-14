import CombatScene from "../../CombatScene/phaser"
import { fadeOut } from "../../UI/Transition"
import MapScreen from "../phaser"
export default function checkCollision(scene: Phaser.Scene) {
    scene.events.on(Phaser.Scenes.Events.UPDATE, check, scene)
}
function check(this: Phaser.Scene) {
    const scene = this
    const squads =
        (scene.data.get(
            "Map Screen Squads"
        ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]) || []

    if (squads.length > 1)
        scene.physics.overlap([squads[0]], [squads[1]], async () => {
            scene.physics.pause()
            scene.events.off(Phaser.Scenes.Events.UPDATE, check)

            await fadeOut(scene, 500)

            scene.scene.add(CombatScene.key, CombatScene)
            scene.scene.start(CombatScene.key)
            scene.scene.remove(MapScreen.key)
        })
}
