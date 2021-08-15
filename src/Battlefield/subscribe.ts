import CloseSquadArrivedInfoMessage, {
    handleCloseSquadArrivedInfoMessage,
} from "./events/CloseSquadArrivedInfoMessage"
import { organizeButtonClicked } from "./ui/organizeButtonClicked"
import turnOff from "./turnOff"
import returnButtonClicked from "../Squad/ListSquadsScene/events/returnButtonClicked"
import CellClicked, { handleCellClick } from "./events/CellClicked"
import { getChara, MapState } from "./Model"
import * as selectChara from "../Chara/commands/selectChara"
import deselectAllEntities from "./commands/deselectAllEntities"
import cellRightClicked from "./board/cellRightClicked"
import SquadFinishesMovement, {
    onSquadFinishesMovement,
} from "./events/SquadFinishesMovement"
import SquadConqueredCity, {
    onSquadConquersCity,
} from "./events/SquadConqueredCity"
import PlayerWins, { onPlayerWins } from "./events/PlayerWins"
import PlayerLoses, { onPlayerLoses } from "./events/PlayerLoses"
import CombatEnded, { combatEnded } from "./events/CombatEnded"
import MovePlayerSquadButtonClicked, {
    handleMovePlayerSquadButtonClicked,
} from "./events/MovePlayerSquadButtonClicked"
import OrganizeButtonClicked from "./events/OrganizeButtonClicked"
import SquadClicked from "./events/SquadClicked"
import RightButtonClickedOnCell from "./events/RightButtonClickedOnCell"

export default function (scene: Phaser.Scene, state: MapState) {
    CellClicked(scene).on((c) => handleCellClick(c))

    MovePlayerSquadButtonClicked(scene).on(handleMovePlayerSquadButtonClicked)

    CloseSquadArrivedInfoMessage(scene).on((container) => {
        handleCloseSquadArrivedInfoMessage(container)
    })

    OrganizeButtonClicked(scene).on(() =>
        organizeButtonClicked(
            {
                turnOff: () => turnOff(scene, state),
                state,
                scene,
            },
            (listScene) => returnButtonClicked(scene, state)(listScene)
        )
    )

    SquadClicked(scene).on((mapSquad) => {
        deselectAllEntities(state)

        const chara = getChara(state, mapSquad.id)
        selectChara.emit(chara)
    })

    RightButtonClickedOnCell(scene).on(cellRightClicked)
    SquadFinishesMovement(scene).on(onSquadFinishesMovement(scene, state))
    SquadConqueredCity(scene).on(onSquadConquersCity(scene, state))
    PlayerWins(scene).on(onPlayerWins)
    PlayerLoses(scene).on(onPlayerLoses)
    CombatEnded(scene).on(combatEnded(scene, state))
}
