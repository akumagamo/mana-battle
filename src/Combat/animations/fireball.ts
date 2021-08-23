import { CharaIndex, getChara } from "../../Chara/Model"
import fireball from "../../Chara/animations/spells/fireball"
import { GAME_SPEED } from "../../env"
import damageUnit from "./damageUnit"
import { delay } from "../../Scenes/utils"
import { getSquad, isUnitInSquad, SquadIndex } from "../../Squad/Model"
import { CombatBoardState } from "../Model"

export default async function (
    sourceId: string,
    targetId: string,
    newHp: number,
    damage: number,
    { scene, charaIndex, unitSquadIndex, left }: CombatBoardState
) {
    const source = getChara(sourceId, charaIndex)
    const target = getChara(targetId, charaIndex)

    const isLeft = isUnitInSquad(sourceId, left, unitSquadIndex)

    const fireballSprite = fireball(
        scene,
        source.container.x,
        source.container.y
    ).setRotation(1.9 * (isLeft ? -1 : 1))

    if (process.env.SOUND_ENABLED) {
        source.scene.sound.add("fireball").play()
    }

    scene.add.tween({
        targets: fireballSprite,
        x: target.container.x,
        y: target.container.y,
        duration: 700 / GAME_SPEED,
        onComplete: () => {
            fireballSprite.destroy()
            damageUnit(target, newHp, damage)
        },
    })

    source.cast()
    await delay(scene, 1000 / GAME_SPEED)
    source.stand()
}
