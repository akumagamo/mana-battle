import events from "../../events"
import { EVENT_CLOSE_SELET_MOVE_DESTINATION } from "./selectMoveDestination"

export default (scene: Phaser.Scene) => (squadId: string) => {
    events(scene).emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)
    events(scene).emit("Squad Selected", squadId)
}
