import { GAME_SPEED } from "../_shared/env"

const transition = (scene: Phaser.Scene, fadeIn: boolean, duration: number) => {
    return new Promise<void>((resolve) => {
        if (fadeIn) scene.cameras.main.fadeIn(duration)
        else scene.cameras.main.fadeOut(duration)

        scene.time.addEvent({
            delay: duration,
            callback: resolve,
        })
    })
}

export const fadeIn = (scene: Phaser.Scene, duration = 500) =>
    transition(scene, true, duration / GAME_SPEED)

export const fadeOut = (scene: Phaser.Scene, duration = 500) =>
    transition(scene, false, duration / GAME_SPEED)
