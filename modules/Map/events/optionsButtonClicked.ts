import { createHandler } from "../../_shared/events"

function handleOptionButtonClicked(scene: Phaser.Scene) {
    scene.scene.transition({
        target: "OptionsScene",
        duration: 0,
        moveBelow: true,
    })
}

export const key = "OptionsButtonClicked"

export const handler = (scene: Phaser.Scene) =>
    createHandler<Phaser.Scene>(scene.events, key)

export const subscribe = (scene: Phaser.Scene) =>
    handler(scene).once(handleOptionButtonClicked)
