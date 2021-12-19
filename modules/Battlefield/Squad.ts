import { List, Map, Range } from "immutable"
import { Unit, UnitId } from "./Unit"

export type SquadId = string & { _squadId: never }
export const SquadId = (id: string) => id as SquadId

type MapPosition = { x: number; y: number } & { _mapPosition: never }

export const MapPosition = (pos: { x: number; y: number }) => pos as MapPosition

export type Squad = {
    id: SquadId
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
    id: string,
    members: [Unit, MemberPosition][]
): Squad => ({
    id: SquadId(id),
    members: Map(
        members.map(([unit, position]) => [unit.id, { unit, position }])
    ),
})
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
