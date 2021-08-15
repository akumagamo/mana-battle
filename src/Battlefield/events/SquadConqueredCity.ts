import { PLAYER_FORCE } from "../../constants"
import { createEvent } from "../../utils"
import { City, MapSquad, MapState } from "../Model"
import speak from "../rendering/speak"
import PlayerLoses from "./PlayerLoses"
import PlayerWins from "./PlayerWins"

export const key = "SquadConqueredCity"

export default (scene: Phaser.Scene) =>
    createEvent<{ squad: MapSquad; city: City }>(scene.events, key)

export const onSquadConquersCity = (scene: Phaser.Scene, state: MapState) => ({
    city,
    squad,
}: {
    city: City
    squad: MapSquad
}) => {
    state.cities = state.cities.map((c) =>
        c.id === city.id ? { ...c, force: squad.squad.force } : c
    )

    if (city.type === "castle") {
        if (squad.squad.force === PLAYER_FORCE) {
            PlayerWins(scene).emit(scene)
        } else {
            PlayerLoses(scene).emit(scene)
        }
    } else {
        if (squad.squad.force === PLAYER_FORCE) {
            speak(scene, state, squad, `We liberated ${city.name}`)
        } else {
            // NOTify player -> enemy squad conquered city
        }
    }
}
