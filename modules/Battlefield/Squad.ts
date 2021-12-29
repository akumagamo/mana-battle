import { right } from "fp-ts/lib/Either"
import { List, Map, Range } from "immutable"
import { Condition, Fallible, runFallible } from "../_shared/Fallible"
import { ForceId } from "./Force"
import { Unit, UnitId } from "./Unit"

export type SquadId = string & { _squadId: never }
export const SquadId = (forceId: ForceId, id: string) =>
    `force/${forceId}/squads/${id}` as SquadId
export const parseSquadId = (id: SquadId) => {
    const [, force] = id.split("/")
    return {
        force: ForceId(force),
        squad: id,
    }
}

type MapPosition = { x: number; y: number } & { _mapPosition: never }

export const MapPosition = (pos: { x: number; y: number }) => pos as MapPosition

export type Squad = {
    id: SquadId
    force: ForceId
    members: Map<
        UnitId,
        {
            unit: Unit
            position: MemberPosition
        }
    >
}
export type DispatchedSquad = Squad & {
    position: MapPosition
}

export const createSquad = (
    idSegment: string,
    force: ForceId,
    members: [Unit, MemberPosition][]
): Fallible<Squad> =>
    runFallible<null, Squad>(
        right(null),
        [
            ...members
                .filter(([unit, pos]) =>
                    members.find(
                        ([unit_, pos_]) =>
                            unit.id !== unit_.id &&
                            pos.x === pos_.x &&
                            pos.y === pos_.y
                    )
                )
                .map(([unit, pos]) =>
                    Condition(
                        unitInSamePositionError(unit.id, pos),
                        () => false
                    )
                ),
        ],
        () => ({
            id: SquadId(force, idSegment),
            force,
            members: Map(
                members.map(([unit, position]) => [unit.id, { unit, position }])
            ),
        })
    )

export const createDispatchedSquad = (
    squad: Squad,
    position: MapPosition
): DispatchedSquad => ({
    ...squad,
    position,
})

export const validateSquad = (squad: Squad): List<string> => {
    const maximumMemberCountError =
        squad.members.size > 5
            ? List([`Squad above size limit of ${5}`])
            : (List() as List<string>)

    const minimumMemberCountError =
        squad.members.size === 0
            ? List([`Squad shouldn't be empty`])
            : (List() as List<string>)

    const unitsInSamePositionError = squad.members
        .map((v, k) =>
            squad.members
                .filter(
                    (v1, k1) =>
                        k1 !== k &&
                        v1.position.x === v.position.x &&
                        v1.position.y === v.position.y
                )
                .keySeq()
                .toList()
                .map(
                    (k1) =>
                        `Unit "${k}" has the same position of unit "${k1}": ${JSON.stringify(
                            v.position
                        )}`
                )
        )
        .toList()
        .reduce((xs, x) => xs.concat(x), List() as List<string>)

    return (List() as List<string>)
        .concat(maximumMemberCountError)
        .concat(minimumMemberCountError)
        .concat(unitsInSamePositionError)
}

type MemberPosition = {
    x: number
    y: number
}

export const boardIndex = (width: number, height: number): MemberPosition[] => {
    const rows = Range(1, width + 1)
    const cols = Range(1, height + 1)

    return rows
        .map((x) => cols.map((y) => ({ x, y })))
        .flatten(1)
        .toJS() as MemberPosition[]
}

export const defaultBoard = boardIndex(3, 3)

export function unitInSamePositionError(
    id: string,
    pos: MemberPosition
): string {
    return `Unit ${id} is on ${JSON.stringify(
        pos
    )}, but there is another unit there.`
}
