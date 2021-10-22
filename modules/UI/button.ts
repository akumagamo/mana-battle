import { Scene } from "phaser"
import text from "./text"

const defaultTextColor = "#ffffff"
const activeTextColor = "#ffffff"

// TODO: refactor: accept event key to fire
// IDEA: create "eventButton" component
// Or accept and event object (to help with typing)
export default (scene: Scene) => (
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    disabled = false,
    width = 300,
    height = 80
) => {
    const container = scene.add.container(x, y)

    const bg = scene.add
        .image(0, 0, "button")
        .setSize(width, height)
        .setDisplaySize(width, height)

    const text_ = text(scene)(0, 0, label)
    text_.setOrigin(0.5)
    text_.setShadow(2, 2, "#000")
    text_.setColor("#fff")

    container.add([bg, text_])
    container.setSize(width, height)

    container.setInteractive()

    container.on("pointerdown", () => {
        if (disabled) return
        bg.setTint(0x666666)
    })
    container.on("pointerup", () => {
        if (disabled) return
        //if (process.env.SOUND_ENABLED) scene.sound.add("click1").play()
        onClick()
    })

    container.on("pointerover", () => {
        if (disabled) return
        bg.setTint(0xeeeeee)
        text_.setColor(activeTextColor)
    })

    container.on("pointerout", () => {
        if (disabled) return
        bg.clearTint()
        text_.setColor(defaultTextColor)
    })

    return container
}
