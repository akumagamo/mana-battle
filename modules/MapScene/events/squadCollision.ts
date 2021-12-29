import { fadeOut } from "../../UI/Transition"
import CombatScene from "../../CombatScene/phaser"
import { SquadId, DispatchedSquad, parseSquadId } from "../../Battlefield/Squad"
import {
    selectNullable,
    Fallible,
    runFallible,
    Condition,
} from "../../_shared/Fallible"
import { MapScreen } from "../Model"
import { right, isRight, isLeft } from "fp-ts/lib/Either"

export default (scene: Phaser.Scene) => async (squadIds: [SquadId, SquadId]) => {
    scene.physics.pause()

    const state = MapScreen(scene).getState()
    const squads = right(
        squadIds
            .map((id) => {
                const { force } = parseSquadId(id)

                return selectNullable(
                    `Should have a dispatched squad with id ${id} on ${squadIds.toString()}`,
                    state.forces
                        .get(force, null)
                        ?.dispatchedSquads.get(id, null)
                ) as Fallible<DispatchedSquad>
            })
            .reduce(
                (xs, sqd) => (isRight(sqd) ? xs.concat([sqd.right]) : xs),
                [] as DispatchedSquad[]
            )
    )

    const result = runFallible(
        squads,
        [
            Condition("should have two squads", (sqds) => sqds.length === 2),
            Condition(
                "should be of different forces",
                ([a, b]) => a.force !== b.force
            ),
        ],
        async (sqds) => {
            await fadeOut(scene, 500)

            scene.scene.add(CombatScene.key, CombatScene, true, {
                squads: sqds,
                state,
            })
            scene.scene.remove(scene)
        }
    )

    if (isLeft(result)) console.error(result)
}
