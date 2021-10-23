import * as NewGameButtonClicked from "./newGameButtonClicked"

export const events = [NewGameButtonClicked]

export const subscribe = (scene: Phaser.Scene) => {
    events.forEach((ev) => ev.subscribe(scene))

    // const clearListeners = () => {
    //     const removeCustomEvents = () =>
    //         (scene.events.eventNames() as string[]).forEach((name) => {
    //             if (name.startsWith("_")) scene.events.off(name)
    //         })

    //     const removeSelf = () => scene.events.off("shutdown", clearListeners)

    //     removeCustomEvents()
    //     removeSelf()
    // }

    // scene.events.on("shutdown", clearListeners)
}

export const emit = (scene: Phaser.Scene) => ({
    NewGameButtonClicked: NewGameButtonClicked.handler(scene).emit,
})

export default {
    subscribe,
    emit,
}
