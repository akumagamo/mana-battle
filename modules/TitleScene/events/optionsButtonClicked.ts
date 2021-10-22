import { createEvent } from "../../../src/utils"

function handleOptionButtonClicked(scene: Phaser.Scene) {
    scene.scene.transition({
        target: "OptionsScene",
        duration: 0,
        moveBelow: true,
    })
}

const key = "OptionsButtonClicked"

const handler = (scene: Phaser.Scene) =>
    createEvent<Phaser.Scene>(scene.events, key)

const subscribe = (scene: Phaser.Scene) =>
    handler(scene).once(handleOptionButtonClicked)

export default {
    key,
    handler,
    subscribe,
}
