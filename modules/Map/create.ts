import { fadeIn } from "../../src/UI/Transition"
import { subscribe } from "./events/_index"
import { renderMap } from "./map"
import { renderUnit } from "./unit"

const coords = [
    [100, 100],
    [200, 200],
]

export const DRAG_TIME_THRESHOLD = 200
export const DRAG_DISTANCE_THRESHOLD = 10

export const create = async (scene: Phaser.Scene) => {
    subscribe(scene)

    const map = renderMap(scene)

    coords.forEach(([x, y]) => {
        renderUnit(scene, map, x, y)
    })

    fadeIn(scene, 500)
}
