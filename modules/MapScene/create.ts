import { fadeIn } from "../UI/Transition"
import checkUnitOverlap from "./events/checkUnitOverlap"
import { createMap } from "./map"
import { createInitialState } from "./Model"
import { createUnit } from "./unit"

export const create = async (scene: Phaser.Scene) => {
    const map = createMap(scene)

    scene.data.set("has created map", true)

    const coords: number[][] = scene.game.registry.get("Map Screen Coords")
    const units = coords.map(([x, y, id]) =>
        createUnit(scene, map, x, y, id.toString())
    )
    scene.data.set(
        "dispatchedSquads",
        coords.map(([, , id]) => id)
    )
    scene.data.set("cities", [])

    scene.data.set("Map Screen Squads", units)

    checkUnitOverlap(scene)

    createInitialState(scene)

    fadeIn(scene, 500)

    scene.game.events.emit("Map Screen Created")
}
