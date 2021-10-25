import { GAME_SPEED } from "../../src/env"
import { fadeIn } from "../../src/UI/Transition"
import createBackground from "./createBackground"
import createGithubIcon from "./createGithubIcon"
import createNewGameButton from "./newGameButton"

export const create = async (scene: Phaser.Scene) => {
    createBackground(scene)

    createNewGameButton(scene)

    createGithubIcon(scene)

    await fadeIn(scene, 500 / GAME_SPEED)
}
