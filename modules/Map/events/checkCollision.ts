import { createEventKey } from "../../_shared/events"

export const key = createEventKey("_CheckCollision")

function checkCollision(scene: Phaser.Scene) {
    scene.events.on(Phaser.Scenes.Events.UPDATE, check)

    function check() {
        const units = scene.data.get(
            "units"
        ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]

        if (units && units.length > 1)
            scene.physics.overlap([units[0]], [units[1]], () => {
                // for now, just stop the simulation
                // we will trigger the combat event here
                console.log(`hit!`)
                scene.physics.pause()
                scene.events.off(Phaser.Scenes.Events.UPDATE, check)
            })
    }
}
export const subscribe = (scene: Phaser.Scene) => {
    checkCollision(scene)
}
