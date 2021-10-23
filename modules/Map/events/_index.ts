import * as NewGameButtonClicked from "./newGameButtonClicked"

export const events = [NewGameButtonClicked]

export const subscribe = (scene: Phaser.Scene) => {
    events.forEach((ev) => ev.subscribe(scene))

//     const clearListeners = () => {
//         events.forEach((ev) => {
//             scene.events.off(ev.key)
//         })

//         scene.events.off("shutdown", clearListeners)
//     }

//     scene.events.on("shutdown", clearListeners)
}

export const emit = (scene: Phaser.Scene) => ({
    NewGameButtonClicked: NewGameButtonClicked.handler(scene).emit,
})

export default {
    subscribe,
    emit,
}
