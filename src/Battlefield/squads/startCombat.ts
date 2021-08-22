import create from "../../Combat/create"
import {
    PLAYER_FORCE,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    CPU_FORCE,
} from "../../constants"
import { GAME_SPEED } from "../../env"
import { INVALID_STATE } from "../../errors"
import { delay } from "../../Scenes/utils"
import { SquadIndex, SquadRecord, unitsWithoutSquad } from "../../Squad/Model"
import panel from "../../UI/panel"
import { disableMapInput, enableMapInput } from "../board/input"
import CombatEnded from "../events/CombatEnded"
import { MapSquad, getSquadUnits, MapState } from "../Model"
import { destroyUI, refreshUI } from "../ui"

export default async function (
    scene: Phaser.Scene,
    state: MapState,
    squads: SquadIndex
) {
    state.isPaused = true

    const { squadA, squadB } = getSquadPositionsObBoard(squads)

    disableMapInput(state)
    destroyUI(state)

    const bg = panel(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        state.uiContainer,
    )
    bg.setAlpha(0.4)

    CombatEnded(scene).once(() => {
        bg.destroy()
        enableMapInput(scene, state)
    })
    await delay(scene, 1000 / GAME_SPEED)

    create(
        {
            squads,
            left: squadA,
            right: squadB,
            units: getSquadUnits(state, squadA.id).merge(
                getSquadUnits(state, squadB.id)
            ),
        },
        scene
    )
}
function getSquadPositionsObBoard(
    squads: SquadIndex
): { squadA: SquadRecord; squadB: SquadRecord } {
    const playerSquad = squads.find((sqd) => sqd.force === PLAYER_FORCE)

    const cpuSquad = squads.find((sqd) => sqd.force === CPU_FORCE)

    if (!cpuSquad) throw new Error(INVALID_STATE)

    if (playerSquad) {
        return {
            squadA: playerSquad,
            squadB: cpuSquad,
        }
    } else {
        const a = squads.first() as SquadRecord
        const b = squads.last() as SquadRecord

        if (!a || !b) throw new Error(INVALID_STATE)
        return { squadA: a, squadB: b }
    }
}
