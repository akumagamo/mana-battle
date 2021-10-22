type Vector2D = { x: number; y: number }

export function randomItem<T>(items: Array<T>): T {
    return items[Math.floor(Math.random() * items.length)]
}

export function getDistance(a: Vector2D, b: Vector2D) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
