import UI from "../../../UI"
import { SCREEN_HEIGHT } from "../../../_shared/constants"
import { getState, getSquad, isAllied } from "../../Model"
import createSquadDetailsModal from "../squadDetailsModal"

const VIEW_SQUAD_DETAILS_LABEL = "View Squad Details"
const MOVE_SQUAD_LABEL = "Move Squad"

export function squadSelected(scene: Phaser.Scene){
  return (squadId: string) => {
    UI.button(scene)(
      100,
      SCREEN_HEIGHT - 50,
      VIEW_SQUAD_DETAILS_LABEL,
      () => {
        createSquadDetailsModal(scene)
      }
    )

    if (isAllied(getSquad(squadId)(getState(scene)))) {
      UI.button(scene)(250, SCREEN_HEIGHT - 50, MOVE_SQUAD_LABEL, () => {
        scene.scene
          .get("Map Screen")
          .events.emit("Select Move Destination", squadId)
      })
    }

    scene.events.once("Squad Deselected", () => [VIEW_SQUAD_DETAILS_LABEL, MOVE_SQUAD_LABEL]
      .map(name=>scene.children.getByName(name))
      .forEach((el) => el?.destroy())
    )
  }
}
