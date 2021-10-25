import text from "../UI/text"
import MapScene from "../MapScene/phaser"
import CombatScene from "./phaser"
import { JobPluginExternalData } from "../_shared/plugins/job"
import {
    CENTER_X,
    CENTER_Y,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from "../_shared/constants"
import { fadeIn, fadeOut } from "../UI/Transition"
import { cartesianToIsometric } from "../_shared/utils"

// IDEA: inject UI module to reduce coupling
export const create = async (scene: Phaser.Scene) => {
    createBackground(scene)
    renderUnits(scene)
    debugReturnButton(scene)
    await fadeIn(scene, 500)
}

function renderUnits(scene: Phaser.Scene) {
    const job = scene.game.cache.json.get(
        "soldier-data"
    ) as JobPluginExternalData

    Object.entries(job.animations).forEach(([key, config]) => {
        const animationName = `${key}_${job.id}`

        const { prefix, start, end, zeroPad, suffix, yoyo, repeat } = config
        const frames = scene.anims.generateFrameNames(`${job.id}_atlas`, {
            prefix,
            start,
            end,
            zeroPad,
            suffix,
        })
        scene.anims.create({
            key: animationName,
            frames,
            repeat,
            yoyo,
        })
    })

    const pos = [
        [1, 1],
        [2, 1],
        [3, 1],
        [1, 2],
        [2, 2],
        [3, 2],
        [1, 3],
        [2, 3],
        [3, 3],

        [5, 1],
        [6, 1],
        [7, 1],
        [5, 2],
        [6, 2],
        [7, 2],
        [5, 3],
        [6, 3],
        [7, 3],
    ]

    pos.forEach(([x_, y_]) => {
        const { x, y } = cartesianToIsometric(x_, y_)

        const soldierA = scene.add.sprite(x + 380, y, "soldier")

        if (x_ < 4) soldierA.play("stand_down_soldier")
        else soldierA.play("stand_up_soldier")
    })
}

function createBackground(scene: Phaser.Scene) {
    const bg = scene.add.image(CENTER_X, CENTER_Y, "backgrounds/plain")
    bg.setDisplaySize(SCREEN_WIDTH, SCREEN_HEIGHT)
}

function debugReturnButton(scene: Phaser.Scene) {
    text(scene)(SCREEN_WIDTH - 100, 20, "Return")
        .setColor("#fff")
        .setInteractive()
        .on("pointerdown", async () => {
            // TODO: have interfaces that accept value objects instead of strings

            await fadeOut(scene, 500)
            scene.scene.add(MapScene.key, MapScene)
            scene.scene.start(MapScene.key)
            scene.scene.remove(CombatScene.key)
        })
}
