import { ForceId } from "../../../Battlefield/Force"
import { SquadId } from "../../../Battlefield/Squad"
import { MapScreen } from "../../Model"

export default (scene: Phaser.Scene) => (forceId: ForceId, squadId: SquadId) => {
    const { events } = MapScreen(scene.scene.manager)

    events.closeSelectMoveDestionation()
    events.squadSelected(forceId, squadId)
}
