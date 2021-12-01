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

    // scene.load.on("fileprogress", (file: Phaser.Loader.File) => {
    //   console.log(file.src);
    // });
    scene.load.on("complete", function () {
        //console.log("complete!");
        progressBar.destroy()
        progressBox.destroy()
    })
}

const jobs = ["soldier"]
export default (scene: Phaser.Scene) => {
    jobs.forEach((job) => {
        scene.load.json(`${job}-data`, `${PUBLIC_URL}/jobs/${job}/data.json`)
        scene.load.atlas(
            `${job}_atlas`,
            `assets/jobs/${job}/animations.png`,
            `assets/jobs/${job}/animations.json`
        )

        const mapSpriteKey = `${job}-map`

        scene.load.spritesheet(
            mapSpriteKey,
            `${PUBLIC_URL}/jobs/${job}/map-animations.png`,
            { frameWidth: 32, frameHeight: 32, endFrame: 11 }
        )
    })

    scene.load.image("squad_test", `${PUBLIC_URL}/sprites/squad_test.png`)

    scene.load.spritesheet("fire", `${PUBLIC_URL}/fire.svg`, {
        frameWidth: 50,
        frameHeight: 117,
        endFrame: 6,
    })
    ;["pipo"].forEach((str) =>
        scene.load.image(str, PUBLIC_URL + "/tileset/" + str + ".png")
    )
    ;["maps/map"].forEach((str) =>
        scene.load.tilemapTiledJSON(str, PUBLIC_URL + "/" + str + ".json")
    )
    ;["backgrounds/sunset", "board"].forEach((str) =>
        scene.load.image(str, PUBLIC_URL + "/" + str + ".svg")
    )
    ;["backgrounds/plain"].forEach((str) =>
        scene.load.image(str, PUBLIC_URL + "/" + str + ".png")
    )
    const ui = [
        "arrow_right",
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

    scene.load.image("arrow", `${PUBLIC_URL}/arrow.svg`)

    progressBar(scene)
}
