import { fadeIn } from "../UI/Transition"
import selectMoveDestination, {
    UNIT_DATA_TARGET,
} from "./events/selectMoveDestination"
import { createMap } from "./map"
import {
    createInitialState,
    MapScreenProperties,
    setState,
    Squad,
} from "./Model"
import { createSquad } from "./squad"
import { createCity } from "./city"
import MapSceneUI from "./UI/phaser"
import events from "./events"
import { squadCollision } from "./events/squadCollision"

export default async (scene: Phaser.Scene, params: MapScreenProperties) => {
    const map = createMap(scene)

    const initialState = createInitialState(params)
    const setState_ = setState(initialState)

    const UI = MapSceneUI(initialState)

    scene.scene.add(UI.key, UI)
    scene.scene.run(UI.key)

    const { allies, enemies } = initialState.squads.reduce(
        (xs, x) => {
            if (x.force.get("force") === "PLAYER")
                return { ...xs, allies: xs.allies.concat([x]) }
            else return { ...xs, enemies: xs.enemies.concat([x]) }
        },
        { allies: [] as Squad[], enemies: [] as Squad[] }
    )

    const alliedGroup = allies.map(createSquad(scene))
    const enemyGroup = enemies.map(createSquad(scene))

    scene.events.on("Squad Collision", squadCollision(scene))

    scene.physics.add.collider(alliedGroup, enemyGroup, async (a, b) => {
        scene.events.emit("Squad Collision", [a.name, b.name])
    })

    initialState.cities.forEach(createCity(scene))

    fadeIn(scene, 500)

    scene.game.events.emit("Map Screen Created")

    events(scene).on("Select Move Destination", (squadId: string) => {
        selectMoveDestination(squadId, map, scene)
    })
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
}
