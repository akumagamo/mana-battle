import { GAME_SPEED } from "../../env"
import { UNIT_JOBS } from "../../Unit/Model"

export default (scene: Phaser.Scene) => {
    loadAnimation(scene, "stand", [0, 1, 2])

    loadAnimation(scene, "cast", [3, 4, 5], false)

    loadAnimation(scene, "run", [6, 7, 8])

    loadAnimation(scene, "hit", [9, 10, 11], false)

    loadAnimation(scene, "die", [12, 13, 14], false)

    loadAnimation(scene, "fireball", [0, 1, 2, 3, 4, 5, 6], false, 12, "fire")

    UNIT_JOBS.forEach((job) => {
        loadAtlasAnimation(`${job}_atlas`, `${job}_stand`, scene)
        loadAtlasAnimation(`${job}_atlas`, `${job}_run`, scene)
        loadAtlasAnimation(`${job}_atlas`, `${job}_cast`, scene, true)
        loadAtlasAnimation(`${job}_atlas`, `${job}_hit`, scene, false, 0)
    })
}

function loadAnimation(
    scene: Phaser.Scene,
    key: string,
    frames: number[],
    repeat = true,
    frameRate = 3,
    texture = "sprite_fighter"
) {
    if (!scene.anims.exists(key))
        scene.anims.create({
            key,
            frames: scene.anims.generateFrameNumbers(texture, {
                frames,
            }),
            frameRate: frameRate * GAME_SPEED,
            repeat: repeat ? -1 : 0,
        })
}

function loadAtlasAnimation(
    atlasKey: string,
    name: string,
    scene: Phaser.Scene,
    yoyo = true,
    repeat = -1
) {
    if (scene.anims.exists(name)) return

    const frames = scene.anims.generateFrameNames(atlasKey, {
        prefix: `${name}_`,
        suffix: ".png",
        start: 0,
        end: 12,
        zeroPad: 2,
    })
    scene.anims.create({
        key: name,
        repeat,
        yoyo,
        frames: frames,
    })
}
