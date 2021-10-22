import OptionsButtonClicked from "./optionsButtonClicked"
import * as NewGameButtonClicked from "./newGameButtonClicked"

export const events = [NewGameButtonClicked, OptionsButtonClicked]

export const subscribe = (scene: Phaser.Scene) => {
    events.forEach((ev) => ev.subscribe(scene))
}

export const emit = (scene: Phaser.Scene) => ({
    OptionsButtonClicked: OptionsButtonClicked.handler(scene).emit,
    NewGameButtonClicked: NewGameButtonClicked.handler(scene).emit,
})

export default {
    subscribe,
    emit,
}
