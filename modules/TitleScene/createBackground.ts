import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../_shared/constants"

export default function (scene: Phaser.Scene) {
    const bg = scene.add.image(0, 0, "backgrounds/sunset")
    bg.setOrigin(0, 0)
    bg.displayWidth = SCREEN_WIDTH
    bg.displayHeight = SCREEN_HEIGHT
    return bg
}
