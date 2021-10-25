import { fadeIn } from "../UI/Transition"
import createBackground from "./createBackground"
import createGithubIcon from "./createGithubIcon"
import createNewGameButton from "./newGameButton"

export const create = async (scene: Phaser.Scene) => {
    createBackground(scene)

    createNewGameButton(scene)

    createGithubIcon(scene)

    await fadeIn(scene, 500)
}
