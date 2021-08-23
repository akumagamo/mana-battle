import { PLAYER_FORCE } from "../../constants"
import { getMapSquad, MapState, Vector } from "../Model"
import { screenToCellPosition } from "./position"
import moveSquadTo from "../squads/moveSquadTo"
import { changeMode } from "../Mode"

export async function issueSquadMoveOrder(
    scene: Phaser.Scene,
    state: MapState,
    { x, y }: Vector,
    id: string
) {
    const squad = getMapSquad(state, id)

    if (squad && squad.squad.force === PLAYER_FORCE) {
        const cell = screenToCellPosition(squad.posScreen)

        if ((cell.x !== x || cell.y !== y) && state.cells[y][x] !== 3)
            moveSquadTo(state, id, { x, y })

        changeMode(scene, state, { type: "SQUAD_SELECTED", id })
    }
}
