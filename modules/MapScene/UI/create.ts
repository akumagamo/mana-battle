import events from "../events"
import moveSquadCancelled from "./events/moveSquadCancelled"
import selectMoveDestination from "./events/selectMoveDestination"
import { squadSelected } from "./events/squadSelected"

export const create = async (scene: Phaser.Scene) => {
    scene.game.events.emit("Map Screen UI Created")

    events.on("Squad Selected", squadSelected(scene))



    selectMoveDestination(scene)

    events.on("Move Squad Cancelled", moveSquadCancelled(scene))
}
