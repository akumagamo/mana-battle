import { PAUSE_BUTTON_KEY } from "../create"

export default (scene: Phaser.Scene) => () =>
    scene.children.getByName(PAUSE_BUTTON_KEY)?.destroy()
