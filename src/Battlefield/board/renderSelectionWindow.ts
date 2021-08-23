import { City, getSquadLeader, MapSquad, MapState } from "../Model"
import { changeMode } from "../Mode"
import selectCityCommand from "../commands/selectCityCommand"
import panel from "../../UI/panel"
import button from "../../UI/button"
import text from "../../UI/text"
import { Set } from "immutable"
import { disableMapInput, enableMapInput } from "./input"
import deselectAllEntities from "../commands/deselectAllEntities"
import { refreshUI } from "../ui"

export function renderSelectionWindow(
    state: MapState,
    scene: Phaser.Scene,
    mapSquads: Set<MapSquad>,
    city: City | undefined,
    selectSquad: (squad: MapSquad) => void
) {
    disableMapInput(state)
    deselectAllEntities(state)
    changeMode(scene, state, { type: "NOTHING_SELECTED" })
    const container = scene.add.container(400, 100)
    state.uiContainer.add(container)
    panel(0, 0, 220, mapSquads.size * 50 + (city ? 150 : 50), container)
    text(10, 10, "Squads", container)

    mapSquads.toList().forEach((sqd, i) => {
        button(
            10,
            50 + i * 50,
            getSquadLeader(state, sqd.id).name,
            container,
            () => {
                selectSquad(sqd)
                container.destroy()
                enableMapInput(scene, state)
            }
        )
    })

    if (city) {
        text(10, mapSquads.size * 50 + 50, "City", container)
        button(10, mapSquads.size * 50 + 100, city.name, container, () => {
            selectCityCommand(scene, state, city)
            container.destroy()
            enableMapInput(scene, state)
            refreshUI(scene, state)
        })
    }
}
