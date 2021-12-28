import { SquadId } from "../Battlefield/Squad"
import { State } from "../Battlefield/State"
import squadClicked from "./events/squadClicked"
import squadSelected from "./UI/events/squadSelected"

export const MapScreen = (manager: Phaser.Scenes.SceneManager) => {
    const scene = manager.getScene("Map Screen")
    const ui = manager.getScene("Map Screen UI")
    const getState = () => scene.data.get("state") as State

    return {
        scene,
        ui,
        getState,
        getSprite: (id: SquadId) =>
            scene.children.getByName(
                id
            ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        tilemap: () =>
            scene.children.getByName("bg") as Phaser.Tilemaps.TilemapLayer,
        events: {
            squadClicked: squadClicked(scene),
            squadSelected: squadSelected(ui),
        },
    }
}
