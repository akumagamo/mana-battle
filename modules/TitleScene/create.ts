import { GAME_SPEED } from "../../src/env"
import { fadeIn } from "../../src/UI/Transition"
import button from "../UI/button"
import {
    CENTER_X,
    CENTER_Y,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from "../_shared/constants"
import { subscribe, emit } from "./events/_index"

export const create = async (scene: Phaser.Scene) => {
    const emitter = emit(scene)

    subscribe(scene)

    createBackground(scene)

    createNewGameButton(scene, emitter.NewGameButtonClicked)

    createGithubIcon(scene)

    await fadeIn(scene, 500 / GAME_SPEED)
}

function createNewGameButton(
    scene: Phaser.Scene,
    callback: (scene: Phaser.Scene) => void
) {
    button(scene)(CENTER_X, CENTER_Y, "New Game", () => callback(scene))
}

function createGithubIcon(scene: Phaser.Scene) {
    const github = scene.add.image(0, 0, "github")
    github.setDisplaySize(64, 64)

    github.setPosition(SCREEN_WIDTH - 64 + 20, SCREEN_HEIGHT - 64 - 20)
    github.setInteractive().on("pointerdown", () => {
        window.location.href = "https://github.com/lfarroco/mana-phaser"
    })
}

function createBackground(scene: Phaser.Scene) {
    const bg = scene.add.image(0, 0, "backgrounds/sunset")
    bg.setOrigin(0, 0)
    bg.displayWidth = SCREEN_WIDTH
    bg.displayHeight = SCREEN_HEIGHT
    return bg
}
