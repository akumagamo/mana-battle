import CombatEnded from "../Battlefield/events/CombatEnded"
import createChara from "../Chara/createChara"
import { emptyIndex } from "../Chara/Model"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants"
import { createUnitSquadIndex, getSquad } from "../Squad/Model"
import { getUnit } from "../Unit/Model"
import { placeUnitOnBoard } from "./combatBoard"
import { CombatBoardState, CombatCreateParams } from "./Model"
import { runTurn } from "./runTurn"

export default async (data: CombatCreateParams, scene: Phaser.Scene) => {
    const state: CombatBoardState = {
        currentTurn: 0,
        left: data.left.id,
        scene,
        squadIndex: data.squads,
        unitIndex: data.units,
        unitSquadIndex: createUnitSquadIndex(data.squads),
        charaIndex: emptyIndex,
    }

    if (process.env.SOUND_ENABLED) {
        scene.sound.stopAll()
        const music = scene.sound.add("combat1")
        music.play()
    }

    const combatants = [data.left, data.right]

    const board = scene.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "board")

    board.alpha = 0.8

    combatants.forEach((squad) => {
        const isLeftSquad = squad.id === data.left.id

        squad.members.forEach((member) => {
            const unit = getUnit(member.id, data.units)

            if (unit.currentHp < 1) return

            const position = placeUnitOnBoard(isLeftSquad)(squad)(member.id)

            const chara = createChara({
                scene: scene,
                unit,
                ...position,
                scale: 2,
                showHpBar: true,
            })
            chara.sprite.setDepth(member.y)

            if (!isLeftSquad) chara.flip()

            chara.stand()

            state.charaIndex = state.charaIndex.set(chara.id, chara)
        })
    })

    CombatEnded(scene).once(() => {
        board.destroy()
    })

    runTurn(state)

    return state
}
