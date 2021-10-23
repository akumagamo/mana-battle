import * as OptionsButtonClicked from "./optionsButtonClicked"
import * as NewGameButtonClicked from "./newGameButtonClicked"

export const events = [NewGameButtonClicked, OptionsButtonClicked]

export const subscribe = (scene: Phaser.Scene) => {
    events.forEach((ev) => ev.subscribe(scene))

    const clearListeners = () => {
        events.forEach((ev) => {
            scene.events.off(ev.key)
        })

        scene.events.off("shutdown", clearListeners)
    }

    scene.events.on("shutdown", clearListeners)
}

export const emit = (scene: Phaser.Scene) => ({
    OptionsButtonClicked: OptionsButtonClicked.handler(scene).emit,
    NewGameButtonClicked: NewGameButtonClicked.handler(scene).emit,
})

export default {
    subscribe,
    emit,
}
