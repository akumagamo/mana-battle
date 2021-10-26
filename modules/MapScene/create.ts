import { fadeIn } from "../UI/Transition"
import checkUnitOverlap from "./events/checkUnitOverlap"
import { createMap } from "./map"
import { createUnit } from "./unit"

// IDEA: inject UI module to reduce coupling
export const create = async (scene: Phaser.Scene) => {
    const map = createMap(scene)

    const coords: number[][] = scene.game.registry.get("MapSceneCoords")

    const units = coords.map(([x, y]) => createUnit(scene, map, x, y))

    scene.data.set("units", units)

    checkUnitOverlap(scene)

    fadeIn(scene, 500)
}
