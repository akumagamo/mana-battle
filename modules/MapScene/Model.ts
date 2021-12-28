import { SquadId } from "../Battlefield/Squad"
import squadClicked from "./events/squadClicked"

export const MapScreen = (manager: Phaser.Scenes.SceneManager) => {
    const scene = manager.getScene("Map Screen")
    return {
        scene,
        getSprite: (id: SquadId) =>
            scene.children.getByName(
                id
            ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
        tilemap: () =>
            scene.children.getByName("bg") as Phaser.Tilemaps.TilemapLayer,
        events: {
            squadClicked: squadClicked(scene),
        },
    }
}
