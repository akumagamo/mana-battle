import { PUBLIC_URL } from "../_shared/constants"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../_shared/constants"

export function progressBar(scene: Phaser.Scene) {
    const width = 400
    const height = 50
    const x = SCREEN_WIDTH / 2 - width / 2
    const y = SCREEN_HEIGHT / 2
    const padding = 10
    let progressBar = scene.add.graphics()
    let progressBox = scene.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(x, y, width, height)

    scene.load.on("progress", (value: number) => {
        progressBar.clear()
        progressBar.fillStyle(0xffffff, 1)
        progressBar.fillRect(
            x + padding,
            y + padding,
            width * value - padding * 2,
            height - padding * 2
        )
    })

    scene.load.on("complete", function () {
        progressBar.destroy()
        progressBox.destroy()
    })
}

export default (scene: Phaser.Scene) => {

    ;["backgrounds/sunset", "board"].forEach((str) =>
        scene.load.image(str, PUBLIC_URL + "/" + str + ".svg")
    )
    const ui = [
        "panel",
        "announcement_bg",
        "button_move",
        "button",
        "button_attack",
        "close_btn",
        "ping",
    ]
    ui.forEach((id: string) => {
        scene.load.image(id, `${PUBLIC_URL}/ui/${id}.svg`)
    })
    const uiPng = ["github"]
    uiPng.forEach((id: string) => {
        scene.load.image(id, `${PUBLIC_URL}/ui/${id}.png`)
    })

    if (process.env.SOUND_ENABLED) {
        const mp3s = ["title"]
        mp3s.forEach((id: string) => {
            scene.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`)
        })
        const oggs = ["click1"]
        oggs.forEach((id: string) => {
            scene.load.audio(id, `${PUBLIC_URL}/music/${id}.ogg`)
        })
    }

    progressBar(scene)
}
