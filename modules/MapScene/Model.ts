import { State } from "../Battlefield/State"
import pauseGame from "./events/pauseGame"
import squadClicked from "./events/squadClicked"
import unpauseGame from "./events/unpauseGame"
import moveSquadCancelled from "./UI/events/moveSquadCancelled"
import { closeSelectMoveDestination } from "./UI/events/selectMoveDestination"
import squadSelected from "./UI/events/squadSelected"

export const MapScreen = ({ scene: { manager } }: Phaser.Scene) => {
    const scene = manager.getScene("Map Screen")
    const ui = manager.getScene("Map Screen UI")
    const getState = () => scene.data.get("state") as State

    return {
        scene,
        ui,
        getState,
        getSprite: (id: string) =>
            scene.children.getByName(
                id
            ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        tilemap: () =>
            scene.children.getByName("bg") as Phaser.Tilemaps.TilemapLayer,
        events: {
            pauseGame: pauseGame(scene),
            unpauseGame: unpauseGame(scene),
            squadClicked: squadClicked(scene),
            moveSquadCancelled: moveSquadCancelled(scene),
            squadSelected: squadSelected(ui),
            closeSelectMoveDestionation: closeSelectMoveDestination(ui),
        },
    }
}
