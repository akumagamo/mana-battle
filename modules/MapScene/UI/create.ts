import UI from "../../UI"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../_shared/constants"

const BG_TEXTURE = "panel"
const PANEL_HEIGHT = 100

export const create = async (scene: Phaser.Scene) => {
    scene.add
        .image(0, SCREEN_HEIGHT - PANEL_HEIGHT, BG_TEXTURE)
        .setDisplaySize(SCREEN_WIDTH, PANEL_HEIGHT)
        .setSize(SCREEN_WIDTH, PANEL_HEIGHT)

    scene.game.events.emit("Map Screen UI Created")

    scene.events.on("Squad Selected", (id: string) => {
        UI.button(scene)(100, SCREEN_HEIGHT - 50, "View Squad Details", () => {
            console.log("view squad details for", id)
        }).setName("View Squad Details Button")
    })
}
