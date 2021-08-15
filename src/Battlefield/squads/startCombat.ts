import create from "../../Combat/create"
import { PLAYER_FORCE, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants"
import { GAME_SPEED } from "../../env"
import { INVALID_STATE } from "../../errors"
import { delay } from "../../Scenes/utils"
import panel from "../../UI/panel"
import { disableMapInput, enableMapInput } from "../board/input"
import CombatEnded from "../events/CombatEnded"
import { MapSquad, getSquadUnits, MapState } from "../Model"
import { destroyUI, refreshUI } from "../ui"

export default async function (
    scene: Phaser.Scene,
    state: MapState,
    squadA: MapSquad,
    squadB: MapSquad
) {
    state.isPaused = true

    const playerSquad = [squadA, squadB].find(
        (sqd) => sqd.squad.force === PLAYER_FORCE
    )

    if (!playerSquad) throw new Error(INVALID_STATE)

    disableMapInput(state)
    destroyUI(state)

    const bg = panel(
        0,
        0,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        state.uiContainer,
        scene
    )
    bg.setAlpha(0.4)

    CombatEnded(scene).once(() => {
        bg.destroy()
        enableMapInput(scene, state)
    })
    await delay(scene, 1000 / GAME_SPEED)

    create(
        {
            left: squadA.id,
            right: squadB.id,
            ...state,
            squads: state.squads
                .map((s) => s.squad)
                .filter((s) => [squadA.id, squadB.id].includes(s.id)),
            units: getSquadUnits(state, squadA.id).merge(
                getSquadUnits(state, squadB.id)
            )
        },
        scene
    )
}
