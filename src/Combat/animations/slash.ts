import { CharaIndex, getChara } from "../../Chara/Model"
import { GAME_SPEED } from "../../env"
import { delay } from "../../Scenes/utils"
import damageUnit from "./damageUnit"

export default async function slash(
    sourceId: string,
    targetId: string,
    newHp: number,
    damage: number,
    { scene, charaIndex }: { scene: Phaser.Scene; charaIndex: CharaIndex }
) {
    const source = getChara(sourceId, charaIndex)
    const target = getChara(targetId, charaIndex)

    source.cast()

    await delay(scene, 500 / GAME_SPEED)

    damageUnit(target, newHp, damage)

    await delay(scene, 200 / GAME_SPEED)
}
