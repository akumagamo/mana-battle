import { Container } from "../../Models"
import { CHARA_INACTIVE_COLOR } from "../colors"
import { Chara } from "../Model"

const HP_BAR_COLOR_GREEN = 0x00ff00
const HP_BAR_COLOR_YELLOW = 0xffff00
const HP_BAR_COLOR_RED = 0xff0000
const HP_BAR_WIDTH = 50
const HP_BAR_HEIGHT = 6
const HP_BAR_BORDER_SIZE = 2
const HP_BAR_Y_POSITION = -40
const HP_BAR_BORDER_COLOR = 0x000000
const HP_BAR_EMPTY_COLOR = 0xffffff

const createHpBar = (
    scene: Phaser.Scene,
    parent: Container,
    hpAmount: number,
    maxHp: number
) => {
    const height = HP_BAR_HEIGHT

    const x = (HP_BAR_WIDTH / 2) * -1
    const y = HP_BAR_Y_POSITION

    const container = scene.add.container(x, y)

    parent.add(container)

    const hpRatio = hpAmount / maxHp

    const hpBar = new Phaser.GameObjects.Graphics(scene)
    container.add(hpBar)

    hpBar.fillStyle(HP_BAR_BORDER_COLOR)
    hpBar.fillRect(
        0,
        0,
        HP_BAR_WIDTH + HP_BAR_BORDER_SIZE * 2,
        HP_BAR_HEIGHT + HP_BAR_BORDER_SIZE * 2
    )

    hpBar.fillStyle(HP_BAR_EMPTY_COLOR)
    hpBar.fillRect(
        HP_BAR_BORDER_SIZE,
        HP_BAR_BORDER_SIZE,
        HP_BAR_WIDTH,
        HP_BAR_HEIGHT
    )

    if (hpRatio > 0.66) hpBar.fillStyle(HP_BAR_COLOR_GREEN)
    else if (hpRatio <= 0.66 && hpRatio >= 0.33)
        hpBar.fillStyle(HP_BAR_COLOR_YELLOW)
    else if (hpRatio < 0.33) hpBar.fillStyle(HP_BAR_COLOR_RED)

    var fillSize = Math.floor(HP_BAR_WIDTH * (hpAmount / maxHp))

    hpBar.fillRect(HP_BAR_BORDER_SIZE, HP_BAR_BORDER_SIZE, fillSize, height)

    return container
}

export default function (chara: Chara, hpAmount: number) {
    if (chara.hpBarContainer) chara.hpBarContainer.destroy()

    if (hpAmount < 1) {
        chara.tint(CHARA_INACTIVE_COLOR)
        return
    }

    chara.hpBarContainer = createHpBar(
        chara.scene,
        chara.container,
        hpAmount,
        chara.unit.hp
    )
}
