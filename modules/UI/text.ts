import { Scene } from "phaser"

/**
 * WARNING: text rendering is very slow.
 * Use this in non critical areas - try to use images where possible.
 * Rendering a couple words can vary between 15ms and 60ms.
 * Calculating metring on first render helps, but images
 * are still faster.
 * */

let metrics: Phaser.Types.GameObjects.Text.TextMetrics | undefined = undefined

export default (scene: Scene) => (
    x: number,
    y: number,
    str: string | number
) => {
    const text = scene.add.text(
        x,
        y,
        typeof str === "number" ? str.toString() : str,
        {
            color: "#ffffff",
            fontSize: "24px",
            fontFamily: "sans-serif",
            metrics,
        }
    )

    if (!metrics) {
        metrics = text.getTextMetrics()
    }
    return text
}
