import { Map, Set } from "immutable"
import { Collection } from "../_shared/Entity"
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

type Relationship = "ALLY" | "ENEMY" | "NEUTRAL"
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

type ForceId = string & { _forceId: never }
const ForceId = (id: string) => id as ForceId

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

export const removeUnit = (
    force: Force,
    id: UnitId
): [errors: string[], force: Force] => {
    const unitNotInBenchError = force.unitsWithoutSquad.has(id)
        ? []
        : [Errors.UNIT_NOT_IN_BENCH(id)]

    const updateForce = () => ({
        ...force,
        unitsWithoutSquad: force.unitsWithoutSquad.delete(id),
    })

    return [[...unitNotInBenchError], updateForce()]
}

/**
 * Rule: All unitIds must be in force.unitsWithoutSquad
 * Rule: unitIds cannot be empty
 * Rule: unitIds cannot have more than 5 items
 */
export const addSquad = (
    force: Force,
    unitIds: UnitId[]
): [string[], Force] => {
    const { unitsWithoutSquad, nonDispatchedSquads, dispatchedSquads } = force

    const units = unitIds.reduce((xs, id) => {
        const unit = unitsWithoutSquad.get(id)

        if (unit) return xs.concat([unit])
        else return xs
    }, [] as Unit[])

    const nonExistingMembers = Set(unitIds).subtract(
        Set(units.map((u) => u.id))
    )

    const unitsNotInBenchErrors = nonExistingMembers
        .map(Errors.UNIT_NOT_IN_BENCH)
        .toJS() as string[]

    const minSizeError = unitIds.length < 1 ? [Errors.FORCE_SQUAD_MIN_SIZE] : []

    const maxSizeError = unitIds.length > 5 ? [Errors.FORCE_SQUAD_MAX_SIZE] : []

    const errors = [...unitsNotInBenchErrors, ...minSizeError, ...maxSizeError]

    const totalSquads = dispatchedSquads.size + nonDispatchedSquads.size

    const board = boardIndex(3, 3)
    const squad = createSquad(
        `force/${force.id}/squads/${totalSquads}`,
        units.map((u, i) => [u, board[i]])
    )

    const updateForce = () => ({
        ...force,
        unitsWithoutSquad: unitsWithoutSquad.deleteAll(unitIds),
        nonDispatchedSquads: nonDispatchedSquads.set(squad.id, squad),
    })

    return [errors, errors.length > 0 ? force : updateForce()]
}

/**
 * Rule: squadId must exist in the bench
 */
export const dispatchSquad = (
    force: Force,
    squadId: SquadId
): [string[], Force] => {
    const { nonDispatchedSquads, dispatchedSquads } = force

    const { error: squadNotFoundError, squad } = getSquadInBench(force, squadId)

    const updateForce = () =>
        squad
            ? {
                  ...force,
                  nonDispatchedSquads: nonDispatchedSquads.delete(squadId),
                  dispatchedSquads: dispatchedSquads.set(squadId, {
                      ...squad,
                      position: MapPosition(force.stronghold),
                  }),
              }
            : force

    return [[...squadNotFoundError], updateForce()]
}

/**
 * Rule: squadId must exist in dispatchSquad collection
 */
export const retreatSquad = (
    force: Force,
    squadId: SquadId
): [errors: string[], force: Force] => {
    const { nonDispatchedSquads, dispatchedSquads } = force

    const { error: squadNotFoundError, squad } = getDispatchedSquad(
        force,
        squadId
    )

    const updateForce = () =>
        squad
            ? {
                  ...force,
                  dispatchedSquads: dispatchedSquads.delete(squadId),
                  nonDispatchedSquads: nonDispatchedSquads.set(squadId, squad),
              }
            : force

    return [[...squadNotFoundError], updateForce()]
}

export const removeSquad = (
    force: Force,
    squadId: SquadId
): [errors: string[], force: Force] => {
    const { nonDispatchedSquads, unitsWithoutSquad } = force
    const { error: squadNotFoundError, squad } = getSquadInBench(force, squadId)

    const updateForce = () =>
        squad
            ? {
                  ...force,
                  nonDispatchedSquads: nonDispatchedSquads.delete(squadId),
                  unitsWithoutSquad: unitsWithoutSquad.merge(
                      squad.members.map((squad) => squad.unit)
                  ),
              }
            : force

    return [[...squadNotFoundError], updateForce()]
}

function getSquadInBench(
    force: Force,
    squadId: SquadId
): { error: string[]; squad: Squad | undefined } {
    const squad = force.nonDispatchedSquads.get(squadId)
    const error = squad ? [] : [Errors.SQUAD_NOT_BENCHED(squadId)]
    return { error, squad }
}

function getDispatchedSquad(
    force: Force,
    squadId: SquadId
): { error: string[]; squad: Squad | undefined } {
    const squad = force.dispatchedSquads.get(squadId)
    const error = squad ? [] : [Errors.SQUAD_NOT_DISPATCHED(squadId)]
    return { error, squad }
}
