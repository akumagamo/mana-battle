import resumeSquadMovement from "./resumeSquadMovement"
import { UNIT_DATA_TARGET } from "./selectMoveDestination"

export default (scene: Phaser.Scene) => () => {
    scene.physics.resume()

    // Phaser bug? When a move order is issued
    // when the physics engine is paused, the sprite
    // moves infinitelly to the right.
    // Here we reissue the move order (if any) to all squads
    scene.children.each((sprite) => {
        if (sprite.data && sprite.data.get(UNIT_DATA_TARGET))
            resumeSquadMovement(
                sprite as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
            )(scene)
    })
}
