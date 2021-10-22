import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../_shared/constants"
import button from "../UI/button"
import events from "./events/_index"

export const create = (scene: Phaser.Scene) => {
    const emitter = events.emit(scene)

    events.subscribe(scene)

    renderBackground(scene)

    // if (localStorage.getItem("saves")) {
    //     button(
    //         SCREEN_WIDTH / 2,
    //         450,
    //         "Continue Game",
    //         state.container,
    //         () => scene.scene.start("SaveListScene"),
    //         false
    //     )
    // }

    renderNewGameButton(scene, emitter.NewGameButtonClicked)

    renderGoFullScreenButton(scene)

    renderGithubIcon(scene)
}

function renderNewGameButton(
    scene: Phaser.Scene,
    callback: (args: Phaser.Scene) => void
) {
    button(scene)(SCREEN_WIDTH / 2, 520, "New Game", () => callback(scene))
}

function renderGoFullScreenButton(scene: Phaser.Scene) {
    button(scene)(SCREEN_WIDTH / 2, 610, "Go Fullscreen", () => {
        //requestFullscreen()
    })
}

function renderGithubIcon(scene: Phaser.Scene) {
    const github = scene.add.image(0, 0, "github")
    github.setDisplaySize(64, 64)

    github.setPosition(SCREEN_WIDTH - 64 + 20, SCREEN_HEIGHT - 64 - 20)
    github.setInteractive().on("pointerdown", () => {
        window.location.href = "https://github.com/lfarroco/mana-phaser"
    })
}

function renderBackground(scene: Phaser.Scene) {
    const bg = scene.add.image(0, 0, "backgrounds/sunset")
    bg.setOrigin(0, 0)
    bg.displayWidth = SCREEN_WIDTH
    bg.displayHeight = SCREEN_HEIGHT
    return bg
}
