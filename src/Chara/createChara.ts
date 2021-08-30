import { Unit } from "../Unit/Model"
import { Chara } from "./Model"
import hpBar from "./ui/hpBar"
import * as selectChara from "./commands/selectChara"
import * as deselectChara from "./commands/deselectChara"
import animations from "./animations/animations"
import { GAME_SPEED } from "../env"

export default (props: {
    scene: Phaser.Scene
    unit: Unit
    x?: number
    y?: number
    scale?: number
    animated?: boolean
    showHpBar?: boolean
}): Chara => {
    const { scene, unit, x = 0, y = 0, scale = 1, showHpBar = false } = props

    const jobPrefix = (name: string) => `${unit.job}_${name}`

    const container = scene.add.container(x, y)
    container.setSize(100, 75)
    const sprite = scene.add
        .sprite(0, 0, jobPrefix("atlas"))
        .play(jobPrefix("stand"))

    container.setScale(scale)

    const hpBarContainer = scene.add.container()
    container.add([sprite, hpBarContainer])

    const chara: Chara = {
        scene,
        sprite,
        id: unit.id,
        unit,
        container,
        x,
        y,
        scale,
        showHpBar,
        hpBarContainer,

        flip: () => {
            sprite.toggleFlipX()
        },

        stand: () => {
            sprite.play(jobPrefix("stand"))
        },
        run: () => {
            sprite.play(jobPrefix("run"))
        },
        cast: () => {
            sprite.play(jobPrefix("cast"))
        },
        hit: () => {
            sprite.play(jobPrefix("hit")).chain(jobPrefix("stand"))
        },
        die: () => {
            sprite.play(jobPrefix("hit"))
            sprite.scene.add.tween({
                targets: sprite,
                alpha: 0,
                duration: 500 / GAME_SPEED,
            })
            chara.hpBarContainer.destroy()
        },
        tint: (value: number) => {
            sprite.setTint(value)
        },
        destroy: () => {
            container.destroy()
        },
        selectedCharaIndicator: null,
    }

    if (showHpBar) {
        hpBar(chara, unit.currentHp)
    }

    animations(scene)

    selectChara.subscribe(chara)
    deselectChara.subscribe(chara)

    return chara
}
