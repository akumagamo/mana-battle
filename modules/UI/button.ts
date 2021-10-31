import { Scene } from "phaser"
import text from "./text"

const defaultTextColor = "#ffffff"
const activeTextColor = "#ffffff"

export default (scene: Scene) =>
    (
        x: number,
        y: number,
        label: string,
        onClick: () => void,
        disabled = false,
        width = 300,
        height = 80
    ) => {
        const bg = scene.add
            .image(0, 0, "button")
            .setSize(width, height)
            .setDisplaySize(width, height)

        const text_ = text(scene)(0, 0, label)
        text_.setOrigin(0.5)
        text_.setShadow(2, 2, "#000")
        text_.setColor("#fff")

        const container = scene.add
            .container(x, y)
            .setName(label)
            .add([bg, text_])
            .setSize(width, height)
            .setInteractive()
            .on("pointerdown", () => {
                if (disabled) return
                bg.setTint(0x666666)
            })
            .on("pointerup", () => {
                if (disabled) return
                //if (process.env.SOUND_ENABLED) scene.sound.add("click1").play()
                onClick()
            })
            .on("pointerover", () => {
                if (disabled) return
                bg.setTint(0xeeeeee)
                text_.setColor(activeTextColor)
            })

            .on("pointerout", () => {
                if (disabled) return
                bg.clearTint()
                text_.setColor(defaultTextColor)
            })

        return container
    }
