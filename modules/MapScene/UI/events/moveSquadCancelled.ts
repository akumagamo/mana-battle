import events from "../../events"
import { EVENT_CLOSE_SELET_MOVE_DESTINATION } from "./selectMoveDestination"

export default (_scene: Phaser.Scene) => (squadId: string) => {
    events.emit(EVENT_CLOSE_SELET_MOVE_DESTINATION)
    events.emit("Squad Selected", squadId)
}
