import { fadeIn } from "../UI/Transition"
import selectMoveDestination, {
    UNIT_DATA_TARGET,
} from "./events/selectMoveDestination"
import { createMap } from "./map"
import { createSquad } from "./squad"
import { createCity } from "./city"
import events from "./events"
import { squadCollision } from "./events/squadCollision"
import { Map } from "immutable"
import { State } from "../Battlefield/State"
import { SquadId } from "../Battlefield/Squad"
import { ForceId } from "../Battlefield/Force"

export default async (scene: Phaser.Scene, { forces, cities }: State) => {
    const map = createMap(scene)

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
                        scene.events.emit("Squad Collision", [a.name, b.name])
                    }
                )
        })
    )

    scene.events.on("Squad Collision", squadCollision(scene))

    await fadeIn(scene, 500)

    events(scene).on(
        "Select Move Destination",
        (forceId: ForceId, squadId: SquadId) => {
            selectMoveDestination(forceId, squadId, map, scene)
        }
    )

    events(scene).on(
        "Resume Squad Movement",
        (sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
            const target = sprite.data.get(
                UNIT_DATA_TARGET
            ) as Phaser.Math.Vector2
            const tile = map.getTileAtWorldXY(target.x, target.y)

            scene.physics.moveToObject(
                sprite,
                { x: target.x, y: target.y },
                tile.properties.speed
            )
        }
    )

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
