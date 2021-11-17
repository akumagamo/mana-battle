import squadClicked from "./events/squadClicked"
import { MapSceneState } from "./Model"
import { Squad } from "./Model"
const UNIT_WIDTH = 50
const UNIT_HEIGHT = 100

export const createSquad =
    (scene: Phaser.Scene, state:MapSceneState, map: Phaser.Tilemaps.TilemapLayer) =>
    (squad: Squad) => {
        const { x, y, id } = squad
        const sprite = scene.physics.add
            .sprite(x, y, "button")
            .setDataEnabled()
            .setSize(UNIT_WIDTH, UNIT_HEIGHT)
            .setDisplaySize(UNIT_WIDTH, UNIT_HEIGHT)
            .setName(`squad-${id.get("squad")}`)

        sprite.body.setSize(UNIT_WIDTH * 4, UNIT_HEIGHT)
        createSquadEvents(scene, map, sprite)
        return sprite
    }

function createSquadEvents(
    scene: Phaser.Scene,
    map: Phaser.Tilemaps.TilemapLayer,
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
    sprite.body.onCollide = true // this might be unecessary
    sprite.setInteractive()

    sprite.on(Phaser.Input.Events.POINTER_UP, () =>
        squadClicked(sprite, map, scene)
    )
}
