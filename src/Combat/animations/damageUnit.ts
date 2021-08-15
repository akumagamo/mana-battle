import { displayDamage } from "../../Chara/animations/displayDamage"
import fadeOutChara from "../../Chara/animations/fadeOutChara"
import { Chara } from "../../Chara/Model"
import hpBar from "../../Chara/ui/hpBar"

export default async function damageUnit(
    chara: Chara,
    newHp: number,
    damage: number
) {
    if (chara.showHpBar) hpBar(chara, newHp)

    if (newHp > 0) chara.hit()
    else {
        fadeOutChara(chara)
        chara.die()
    }

    displayDamage(chara, damage)
}
