import { fadeIn } from "../UI/Transition"
import createBackground from "./createBackground"
import createGithubIcon from "./createGithubIcon"
import creditsButton from "./creditsButton"
import createNewGameButton from "./newGameButton"

export const create = async (scene: Phaser.Scene) => {

    createBackground(scene)

    createNewGameButton(scene)

    creditsButton(scene)

    createGithubIcon(scene)

    fadeIn(scene, 500)

    scene.game.events.emit("Title Screen Created")
}
