import { CPU_FORCE, PLAYER_FORCE } from "../../constants"
import { createEvent } from "../../utils"
import { screenToCellPosition } from "../board/position"
import { getChara, MapSquad, MapState } from "../Model"
import speak from "../rendering/speak"
import SquadArrivedInfoMessageCompleted from "./SquadArrivedInfoMessageCompleted"
import SquadConqueredCity from "./SquadConqueredCity"

export const key = "SquadFinishesMovement"

export default (scene: Phaser.Scene) => createEvent<MapSquad>(scene.events, key)

export const onSquadFinishesMovement = (
    scene: Phaser.Scene,
    state: MapState
) => (squad: MapSquad) => {
    state.squadsInMovement = state.squadsInMovement.delete(squad.id)

    const chara = getChara(state, squad.id)
    chara.stand()

    const city = state.cities.find((city) => {
        const { x, y } = screenToCellPosition(squad.posScreen)

        return city.x === x && city.y === y
    })

    state.squads = state.squads.setIn(
        [squad.id, "status"],
        city ? "guarding_fort" : "standing"
    )

    if (city && city.force !== squad.squad.force) {
        SquadConqueredCity(scene).emit({ squad, city })
    } else if (squad.squad.force === PLAYER_FORCE) {
        const speechWindow = speak(
            scene,
            state,
            squad,
            "We arrived at the target destination"
        )
        SquadArrivedInfoMessageCompleted(scene).emit(speechWindow)
    }

    if (squad.squad.force === CPU_FORCE) {
        state.ai = state.ai.set(squad.id, "DEFEND")
    }
}
