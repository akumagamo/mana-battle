import { ForceId } from "../../../Battlefield/Force"
import { SquadId } from "../../../Battlefield/Squad"
import events from "../../events"
import { MapScreen } from "../../Model"
import { EVENT_CLOSE_SELET_MOVE_DESTINATION } from "./selectMoveDestination"

export default (scene: Phaser.Scene) => (forceId: ForceId, squadId: SquadId) => {
    events(scene).emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)

    MapScreen(scene.scene.manager).events.squadSelected(forceId, squadId)
}
