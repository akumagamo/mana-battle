import { Unit } from "../Unit/Model"
import { Container, Image } from "../Models"
import { Map } from "immutable"
import { INVALID_STATE } from "../errors"

export type Chara = {
    scene: Phaser.Scene
    id: string
    unit: Unit
    container: Container
    x: number
    y: number
    scale: number
    showHpBar: boolean
    hpBarContainer: Container

    sprite: Phaser.GameObjects.Sprite

    flip: () => void

    stand: () => void
    hit: () => void
    cast: () => void
    run: () => void
    die: () => void

    tint: (value: number) => void
    destroy: () => void

    selectedCharaIndicator: Image | null
}

export type CharaIndex = Map<string, Chara>
export const emptyIndex = Map() as CharaIndex

export const getChara = (id: string, index: CharaIndex): Chara => {
    const chara = index.get(id)

    if (!chara) throw new Error(INVALID_STATE)

    return chara
}
