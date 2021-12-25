import { fromNullable, right } from "fp-ts/lib/Either"
import { Map } from "immutable"
import { Collection } from "../_shared/Entity"
import { Fallible, runFallible } from "../_shared/Fallible"
import * as Errors from "./Force.errors"
import {
    boardIndex,
    createSquad,
    DispatchedSquad,
    MapPosition,
    Squad,
    SquadId,
} from "./Squad"
import { Unit, UnitId } from "./Unit"

export type Relationship = "ALLY" | "ENEMY" | "NEUTRAL"
export const Relationships: { [x in Relationship]: Relationship } = {
    ALLY: "ALLY",
    ENEMY: "ENEMY",
    NEUTRAL: "NEUTRAL",
}

type ForceController = "PLAYER" | "COMPUTER"
export const ForceControllers: { [x in ForceController]: ForceController } = {
    PLAYER: "PLAYER",
    COMPUTER: "COMPUTER",
}

export type ForceId = string & { _forceId: never }
export const ForceId = (id: string) => id as ForceId

export type Force = {
    id: ForceId
    name: string
    gold: number
    stronghold: { x: number; y: number }
    unitsWithoutSquad: Collection<Unit>
    dispatchedSquads: Collection<DispatchedSquad>
    nonDispatchedSquads: Collection<Squad>
    controller: ForceController
    relations: Map<ForceId, Relationship>
}

export const createForce = (id: string): Force => ({
    id: ForceId(id),
    name: `Force ${id}`,
    gold: 0,
    stronghold: { x: 0, y: 0 },
    unitsWithoutSquad: Map() as Collection<Unit>,
    dispatchedSquads: Map() as Collection<DispatchedSquad>,
    nonDispatchedSquads: Map() as Collection<Squad>,
    controller: "COMPUTER" as "COMPUTER",
    relations: Map() as Map<ForceId, Relationship>,
})

export const addUnit = (force: Force, unit: Unit) => ({
    ...force,
    unitsWithoutSquad: force.unitsWithoutSquad.set(unit.id, unit),
})

export const removeUnit = (force: Force, id: UnitId): Fallible<Force> => {
    return runFallible(right(force), [unitShouldBeInBench(id)], (force) => ({
        ...force,
        unitsWithoutSquad: force.unitsWithoutSquad.delete(id),
    }))
}
export const updateUnit = (force: Force, updatedUnit: Unit): Fallible<Force> =>
    runFallible(
        right(force),
        [unitShouldBeInBench(updatedUnit.id)],
        (force_) => ({
            ...force_,
            unitsWithoutSquad: force.unitsWithoutSquad.set(
                updatedUnit.id,
                updatedUnit
            ),
        })
    )

export const addSquad =
    (unitIds: UnitId[]) =>
    (force: Force): Fallible<Force> => {
        const { unitsWithoutSquad, nonDispatchedSquads, dispatchedSquads } =
            force

        return runFallible(
            right(force),
            [
                squadHasMinSize(unitIds),
                squadIsBelowMaxSize(unitIds),
                ...unitsAreInBench(unitIds, unitsWithoutSquad),
            ],
            (force_) => {
                const units = getAllFrom(unitIds, unitsWithoutSquad)

                const totalSquads =
                    dispatchedSquads.size + nonDispatchedSquads.size

                const board = boardIndex(3, 3)
                const squad = createSquad(
                    `force/${force.id}/squads/${totalSquads}`,
                    force.id,
                    units.map((u, i) => [u, board[i]])
                )
                return {
                    ...force_,
                    unitsWithoutSquad: unitsWithoutSquad.deleteAll(unitIds),
                    nonDispatchedSquads: nonDispatchedSquads.set(
                        squad.id,
                        squad
                    ),
                }
            }
        )
    }

export const dispatchSquad =
    (squadId: SquadId) =>
    (force: Force): Fallible<Force> => {
        const { nonDispatchedSquads, dispatchedSquads } = force

        return runFallible(getSquadInBench(force, squadId), [], (squad) => {
            const dispatched: DispatchedSquad = {
                ...squad,
                position: MapPosition(force.stronghold),
            }
            return {
                ...force,
                nonDispatchedSquads: nonDispatchedSquads.delete(squad.id),
                dispatchedSquads: dispatchedSquads.set(squad.id, dispatched),
            }
        })
    }

export const retreatSquad =
    (squadId: SquadId) =>
    (force: Force): Fallible<Force> => {
        const { nonDispatchedSquads, dispatchedSquads } = force

        return runFallible(getDispatchedSquad(force, squadId), [], (squad) => ({
            ...force,
            dispatchedSquads: dispatchedSquads.delete(squadId),
            nonDispatchedSquads: nonDispatchedSquads.set(squadId, squad),
        }))
    }

export const removeSquad =
    (squadId: SquadId) =>
    (force: Force): Fallible<Force> => {
        const { nonDispatchedSquads, unitsWithoutSquad } = force

        return runFallible(getSquadInBench(force, squadId), [], (squad) => ({
            ...force,
            nonDispatchedSquads: nonDispatchedSquads.delete(squadId),
            unitsWithoutSquad: unitsWithoutSquad.merge(
                squad.members.map((squad) => squad.unit)
            ),
        }))
    }

function getAllFrom<A>(ids: string[], collection: Collection<A>) {
    return ids.reduce((xs, id) => {
        const item = collection.get(id)
        if (item) return xs.concat([item])
        else return xs
    }, [] as A[])
}

function unitsAreInBench(
    unitIds: UnitId[],
    unitsWithoutSquad: Collection<Unit>
): [string, (f: Force) => boolean][] {
    return unitIds.map((id) => [
        Errors.UNIT_NOT_IN_BENCH(id),
        (_f: Force) => unitsWithoutSquad.has(id),
    ])
}

function squadIsBelowMaxSize(
    unitIds: UnitId[]
): [string, (a: Force) => boolean] {
    return [Errors.FORCE_SQUAD_MAX_SIZE, (_f: Force) => unitIds.length <= 5]
}

function squadHasMinSize(unitIds: UnitId[]): [string, (a: Force) => boolean] {
    return [Errors.FORCE_SQUAD_MIN_SIZE, (_f: Force) => unitIds.length > 0]
}

function unitShouldBeInBench(id: UnitId): [string, (a: Force) => boolean] {
    return [
        `Unit ${id} should be in the bench.`,
        (f) => Boolean(f.unitsWithoutSquad.get(id)),
    ]
}

function getSquadInBench(force: Force, squadId: SquadId): Fallible<Squad> {
    return fromNullable([Errors.SQUAD_NOT_BENCHED(squadId)])(
        force.nonDispatchedSquads.get(squadId, null)
    )
}

function getDispatchedSquad(force: Force, squadId: SquadId): Fallible<Squad> {
    return fromNullable([Errors.SQUAD_NOT_DISPATCHED(squadId)])(
        force.dispatchedSquads.get(squadId, null)
    )
}
