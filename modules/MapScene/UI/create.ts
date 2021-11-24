import events from "../events"
import moveSquadCancelled from "./events/moveSquadCancelled"
import listenToSelectMovesDestinationEvents from "./events/selectMoveDestination"
import { squadSelected } from "./events/squadSelected"

export const create = async (scene: Phaser.Scene) => {
    scene.game.events.emit("Map Screen UI Created")

    events(scene).on("Squad Selected", squadSelected(scene))

    listenToSelectMovesDestinationEvents(scene)

    events(scene).on("Move Squad Cancelled", moveSquadCancelled(scene))
}
