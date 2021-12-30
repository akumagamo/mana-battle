import { fadeIn } from "../UI/Transition"
import { createMap } from "./map"
import { createSquad } from "./squad"
import { createCity } from "./city"
import squadCollision from "./events/squadCollision"
import { Map } from "immutable"
import { State } from "../Battlefield/State"
import { SquadId } from "../Battlefield/Squad"

export default async (scene: Phaser.Scene, state: State) => {
    const { forces, cities } = state
    scene.data.set("state", state)

    createMap(scene)

    createAnimations(scene)

    cities.forEach(createCity(scene))

    const squads = forces.map((f) =>
        f.dispatchedSquads.map((s) => createSquad(scene)(s, f))
    )

    const toJS = (
        sqds: Map<string, Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>
    ) =>
        sqds
            .toList()
            .toJS() as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]

    //todo: make collision happen only with enemy forces
    squads.forEach((squads_) =>
        squads.forEach((squads__) => {
            if (!squads_.equals(squads__))
                scene.physics.add.collider(
                    toJS(squads_),
                    toJS(squads__),
                    (a, b) => {
                        squadCollision(scene)([
                            a.name as SquadId,
                            b.name as SquadId,
                        ])
                    }
                )
        })
    )

    await fadeIn(scene, 500)

    scene.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
        const sprt = scene.add.image(p.x, p.y, "ping").setScale(0.2)
        scene.tweens.add({
            targets: sprt,
            duration: 2000,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            onComplete: () => {
                sprt.destroy()
            },
        })
    })

    scene.game.events.emit("Map Screen Created")
}

function createAnimations(scene: Phaser.Scene) {
    const jobs = ["soldier", "skeleton"]

    jobs.forEach((job) => {
        const mapSpriteKey = `${job}-map`

        const directions = [
            { dir: "down", start: 0, end: 2 },
            { dir: "left", start: 3, end: 5 },
            { dir: "right", start: 6, end: 8 },
            { dir: "top", start: 9, end: 11 },
        ]

        directions.forEach(({ dir, start, end }) => {
            const frames = scene.anims.generateFrameNumbers(mapSpriteKey, {
                start,
                end,
            })
            const config = {
                key: `${job}-map-walk-${dir}`,
                frames,
                frameRate: 3,
                repeat: -1,
            }

            scene.anims.create(config)
        })
    })
}
