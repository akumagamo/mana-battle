import button from "../../UI/button"
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants"
import { TitleSceneState } from "./Model"
import { turnOff } from "./turnOff"
import { changeMusic } from "./changeMusic"
import { requestFullscreen } from "../../Browser/requestFullscreen"
import { emitter, subscribeToEvents } from "./events"

export function create(scene: Phaser.Scene, state: TitleSceneState) {
    scene.events.once("shutdown", () => turnOff(scene, state))

    const emit = emitter(scene)

    subscribeToEvents(scene)

    state.container = scene.add.container(0, 0)
    const bg = scene.add.image(0, 0, "backgrounds/sunset")
    bg.setOrigin(0, 0)
    bg.displayWidth = SCREEN_WIDTH
    bg.displayHeight = SCREEN_HEIGHT
    state.container.add(bg)

    changeMusic(scene, state, "title")

    if (localStorage.getItem("saves")) {
        button(
            SCREEN_WIDTH / 2,
            450,
            "Continue Game",
            state.container,
            () => scene.scene.start("SaveListScene"),
            false
        )
    }
    button(SCREEN_WIDTH / 2, 520, "New Game", state.container, () =>
        emit.NewGameButtonClicked({ scene, state })
    )

    button(SCREEN_WIDTH / 2, 590, "Go Fullscreen", state.container, () => {
        requestFullscreen()
    })

    const github = scene.add.image(0, 0, "github")
    github.setDisplaySize(64, 64)

    github.setPosition(SCREEN_WIDTH - 64 + 20, SCREEN_HEIGHT - 64 - 20)
    github.setInteractive().on("pointerdown", () => {
        window.location.href = "https://github.com/lfarroco/mana-phaser"
    })
}
