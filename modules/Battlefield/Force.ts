import { Map } from "immutable"
import { Collection } from "../_shared/Entity"
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

type Controller = "PLAYER" | "COMPUTER"

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
    controller: Controller
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

export const removeUnit = (force: Force, unit: Unit) => ({
    ...force,
    unitsWithoutSquad: force.unitsWithoutSquad.delete(unit.id),
})

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

    const units = unitIds.map((id) => unitsWithoutSquad.get(id)) as Unit[]

    const nonExistingMembers = units.filter(
        (unit) => !unitsWithoutSquad.has(unit.id)
    )

    const nonExistingMembersErrors = nonExistingMembers.map(
        (m) =>
            `Unit ${m.id} is not present in the non-dispatched unit collection.`
    )

    const minSizeError = unitIds.length < 1 ? ["No units were provided"] : []

    const maxSizeError =
        unitIds.length > 5 ? ["More than 5 units were provided"] : []

    const errors = [
        ...nonExistingMembersErrors,
        ...minSizeError,
        ...maxSizeError,
    ]

    const totalSquads = dispatchedSquads.size + nonDispatchedSquads.size

    const board = boardIndex(3, 3)
    const squad = createSquad(
        `force/${force.id}/squad/${totalSquads + 1}`,
        units.map((u, i) => [u, board[i]])
    )

    const updatedForce = {
        ...force,
        nonDispatchedSquads: nonDispatchedSquads.set(squad.id, squad),
    }

    return [errors, updatedForce]
}

/**
 * Rule: squadId must exist in the bench
 */
export const dispatchSquad = (force: Force, squadId: SquadId) => {
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
export const retreatSquad = (force: Force, squadId: SquadId) => {
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

export const removeSquad = (force: Force, squadId: SquadId) => {
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

function getSquadInBench(force: Force, squadId: SquadId) {
    const squad = force.nonDispatchedSquads.get(squadId)
    const error = squad ? [] : [`Provided squad ${squadId} is not in the bench`]
    return { error, squad }
}

function getDispatchedSquad(force: Force, squadId: SquadId) {
    const squad = force.dispatchedSquads.get(squadId)
    const error = squad ? [] : [`Provided squad ${squadId} is not dispatched`]
    return { error, squad }
}
