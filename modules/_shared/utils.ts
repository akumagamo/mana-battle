type Vector2D = { x: number; y: number }

const ISOMETRIC_CELL_WIDTH = 128
const ISOMETRIC_CELL_HEIGHT = 64

export function randomItem<T>(items: Array<T>): T {
    return items[Math.floor(Math.random() * items.length)]
}

export function getDistance(a: Vector2D, b: Vector2D) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

/** Converts board coordinates to a x,y position on a isometric scene */

export function cartesianToIsometric(x: number, y: number) {
    return {
        x: (x - y) * ISOMETRIC_CELL_WIDTH,
        y: (x + y) * ISOMETRIC_CELL_HEIGHT,
    }
}
