import { fadeIn, fadeOut } from "../UI/Transition"
import selectMoveDestination from "./events/selectMoveDestination"
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
import CombatScene from "../CombatScene/phaser"
import events from "./events"

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

    scene.physics.add.collider(alliedGroup, enemyGroup, async (_a, _b) => {
        scene.physics.pause()

        await fadeOut(scene, 500)

        scene.scene.add(CombatScene.key, CombatScene)
        scene.scene.start(CombatScene.key)
        scene.scene.remove(scene)
    })

    initialState.cities.forEach(createCity(scene))

    fadeIn(scene, 500)

    scene.game.events.emit("Map Screen Created")

    events(scene).on("Select Move Destination", (squadId: string) => {
        selectMoveDestination(squadId, map, scene)
    })
}
