import events from "../events"
import { State } from "../Model"
import moveSquadCancelled from "./events/moveSquadCancelled"
import listenToSelectMovesDestinationEvents from "./events/selectMoveDestination"
import { squadSelected } from "./events/squadSelected"

export default async (scene: Phaser.Scene, state: State) => {
    scene.game.events.emit("Map Screen UI Created")

    events(scene).on("Squad Selected", squadSelected(scene, state))

    listenToSelectMovesDestinationEvents(scene)

    events(scene).on("Move Squad Cancelled", moveSquadCancelled(scene))
}
