import { fadeIn } from "../../src/UI/Transition"
import checkCollision from "./events/checkCollision"
import { createMap } from "./map"
import { createUnit } from "./unit"

const coords = [
    [100, 100],
    [200, 200],
]

// IDEA: inject UI module to reduce coupling
export const create = async (scene: Phaser.Scene) => {
    const map = createMap(scene)

    const units = coords.map(([x, y]) => createUnit(scene, map, x, y))

    scene.data.set("units", units)

    checkCollision(scene)

    fadeIn(scene, 500)
}
