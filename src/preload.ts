import preloadCharaAssets from "./Chara/preloadCharaAssets"
import { PUBLIC_URL } from "./constants"
import { progressBar } from "./progressBar"

const jobs = ["soldier"]
export function preload(this: Phaser.Scene) {
    jobs.forEach((job) => {
        this.load.json(`${job}-data`, `${PUBLIC_URL}/jobs/${job}/data.json`)
        this.load.atlas(
            `${job}_atlas`,
            `assets/jobs/${job}/animations.png`,
            `assets/jobs/${job}/animations.json`
        )
    })

    this.load.spritesheet("fire", `${PUBLIC_URL}/fire.svg`, {
        frameWidth: 50,
        frameHeight: 117,
        endFrame: 6,
    })
    ;["map/kenney_tileset"].forEach((str) =>
        this.load.image(str, PUBLIC_URL + "/" + str + ".png")
    )
    ;["maps/map"].forEach((str) =>
        this.load.tilemapTiledJSON(str, PUBLIC_URL + "/" + str + ".json")
    )
    ;["backgrounds/sunset", "board"].forEach((str) =>
        this.load.image(str, PUBLIC_URL + "/" + str + ".svg")
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
        this.load.image(id, `${PUBLIC_URL}/ui/${id}.svg`)
    })
    const uiPng = ["github"]
    uiPng.forEach((id: string) => {
        this.load.image(id, `${PUBLIC_URL}/ui/${id}.png`)
    })

    if (process.env.SOUND_ENABLED) {
        const mp3s = ["title"]
        mp3s.forEach((id: string) => {
            this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`)
        })
        const oggs = ["click1"]
        oggs.forEach((id: string) => {
            this.load.audio(id, `${PUBLIC_URL}/music/${id}.ogg`)
        })
    }

    this.load.image("map_select", `${PUBLIC_URL}/scenes/map_select.jpg`)

    this.load.html("nameform", "assets/chara-creation/input.html")

    this.load.image("arrow", `${PUBLIC_URL}/arrow.svg`)

    preloadCharaAssets(this)

    progressBar(this)
}
