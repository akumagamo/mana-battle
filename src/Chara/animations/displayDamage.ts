import { GAME_SPEED } from "../../env"
import text from "../../UI/text"
import { Chara } from "../Model"

const TEXT_DAMAGE_POSITION_X = -20
const TEXT_DAMAGE_POSITION_Y = -80
const TEXT_DAMAGE_STROKE_COLOR = "#000000"
const TEXT_DAMAGE_STROKE_WIDTH = 4
const TEXT_DAMAGE_FADE_OUT_DURATION = 1500
const TEXT_DAMAGE_FADE_OUT_Y_DISTANCE = -20

export function displayDamage(chara: Chara, damage: number) {
    const container = chara.scene.add.container()
    const dmg = text(
        chara.container.x + TEXT_DAMAGE_POSITION_X,
        chara.container.y + TEXT_DAMAGE_POSITION_Y,
        damage.toString(),
        container,
        chara.scene
    )
    dmg.setShadow(2, 2, "#000")
    dmg.setStroke(TEXT_DAMAGE_STROKE_COLOR, TEXT_DAMAGE_STROKE_WIDTH)
    dmg.setScale(2)
    dmg.setAlign("center")
    dmg.setFontStyle("bold")

    chara.scene.tweens.add({
        targets: dmg,
        y: dmg.y + TEXT_DAMAGE_FADE_OUT_Y_DISTANCE,
        duration: TEXT_DAMAGE_FADE_OUT_DURATION / GAME_SPEED,
        onComplete: () => {
            container.destroy()
        },
    })
}
