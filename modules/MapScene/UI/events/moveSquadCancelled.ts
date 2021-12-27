import { ForceId } from "../../../Battlefield/Force"
import { SquadId } from "../../../Battlefield/Squad"
import events from "../../events"
import { EVENT_CLOSE_SELET_MOVE_DESTINATION } from "./selectMoveDestination"

export default (scene: Phaser.Scene) => (forceId: ForceId, squadId: SquadId) => {
    events(scene).emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)
    events(scene).emit("Squad Selected", forceId, squadId)
}
