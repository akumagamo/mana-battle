import { Scene } from "phaser"

/**
 * WARNING: text rendering is very slow.
 * Use this in non critical areas - try to use images where possible.
 * Rendering a couple words can vary between 15ms and 60ms.
 * Calculating metring on first render helps, but images
 * are still faster.
 * */

let metrics: Phaser.Types.GameObjects.Text.TextMetrics | undefined = undefined

export default (scene: Scene) => (x: number, y: number, str: string | number) => {
    const label = typeof str === "number" ? str.toString() : str
    const text = scene.add
        .text(x, y, label, {
            color: "#ffffff",
            fontSize: "24px",
            fontFamily: "'Laila', sans-serif",
            metrics,
        })
        .setName(label)
        .setOrigin(0.5)

    if (!metrics) {
        metrics = text.getTextMetrics()
    }
    return text
}
