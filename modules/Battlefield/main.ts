import createUI from "../MapScene/UI/main"
import createMapScreen from "../MapScene/main"
import { pipe } from "fp-ts/lib/function"
import { addCity, addForce, emptyState } from "./State"
import {
    addSquad,
    addUnit,
    createForce,
    dispatchSquad,
    Force,
    ForceControllers,
    ForceId,
} from "./Force"
import { createUnit } from "./Unit"
import { range } from "fp-ts/lib/NonEmptyArray"
import { createCity, City } from "./City"
import { runFallible, validateProperties } from "../_shared/Fallible"
import { SquadId } from "./Squad"
import { chain } from "fp-ts/lib/Either"

export const main = (scene: Phaser.Scene) => {
    return {
        start: () => {
            const units = range(0, 10).map((n) => createUnit(n.toString()))

            const playerForce = createForce("PLAYER")
            const player = pipe(
                units.reduce((xs, x) => addUnit(x)(xs), {
                    ...playerForce,
                    stronghold: { x: 100, y: 100 },
                    controller: ForceControllers.PLAYER,
                }),
                addSquad(units.map((u) => u.id).slice(0, 4)),
                chain(dispatchSquad(SquadId(playerForce.id, "0")))
            )

            const computerForce = createForce("COMPUTER")
            const computer = pipe(
                units.reduce((xs, x) => addUnit(x)(xs), {
                    ...computerForce,
                    stronghold: { x: 200, y: 100 },
                }),
                addSquad(units.map((u) => u.id).slice(0, 4)),
                chain(dispatchSquad(SquadId(computerForce.id, "0")))
            )

            const playerCity = {
                ...createCity("c1"),
                position: { x: 100, y: 100 },
                force: ForceId("PLAYER"),
            } as City
            const computerCity = {
                ...createCity("c2"),
                position: { x: 200, y: 100 },
                force: ForceId("COMPUTER"),
            } as City

            const forces = {
                player,
                computer,
            }

            const res =
                validateProperties<{ player: Force; computer: Force }>(forces)

            const result = runFallible(res, [], ({ player, computer }) => {
                const state = pipe(
                    emptyState,
                    addForce(player),
                    addForce(computer),
                    addCity(playerCity),
                    addCity(computerCity)
                )

                createMapScreen(scene, state)
                createUI(scene, state)
            })

            console.log(result)
        },
        destroy: () => {
            //something like
            //scene.scene.remove('MapScreen')
            //scene.scene.remove('MapScreenUI')
            //or even better
            //destroyMapScreen(scene)
            //destroyMapScreenUI(scene)
        },
    }
}
