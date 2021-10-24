import * as CheckCollision from "./checkCollision"

export const events = [CheckCollision]

export const subscribe = (scene: Phaser.Scene) => {
    events.forEach((ev) => ev.subscribe(scene))
}

export const emit = (_scene: Phaser.Scene) => ({})

export default {
    subscribe,
    emit,
}
