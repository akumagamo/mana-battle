import { List, Map, Record, RecordOf } from "immutable"
import { INVALID_STATE } from "../errors"
import { getUnit, Unit, UnitIndex } from "../Unit/Model"

export type ForceId = string

export type Model = {
    id: string
    members: MemberIndex
    force: ForceId
    leader: string
}
export type SquadRecord = RecordOf<Model>

export type Member = {
    id: string
    x: number
    y: number
}
export type MemberRecord = RecordOf<Member>

export type MemberIndex = Map<string, MemberRecord>
export const emptyMemberIndex = Map() as MemberIndex

export type SquadIndex = Map<string, SquadRecord>

export const emptyIndex = Map() as SquadIndex

export const getSquad = (id: string, index: SquadIndex) => {
    const squad = index.get(id)

    if (!squad) throw new Error(INVALID_STATE)
    return squad
}

/** unit -> squad */
export type UnitSquadIndex = Map<string, string>

export const createUnitSquadIndex = (squads: SquadIndex): UnitSquadIndex =>
    squads.reduce((xs, x) => {
        const squadUnits = x.members.map(() => x.id)
        return xs.merge(squadUnits)
    }, emptyUnitSquadIndex)

export const emptyUnitSquadIndex = Map() as UnitSquadIndex

export const getUnitSquad = (
    unitId: string,
    index: SquadIndex,
    unitSquadIndex: UnitSquadIndex
) => {
    const squad = unitSquadIndex.get(unitId)

    if (!squad) throw new Error(INVALID_STATE)

    return getSquad(squad, index)
}

export const isUnitInSquad = (
    unitId: string,
    squadId: string,
    index: UnitSquadIndex
) => Boolean(index.get(unitId) === squadId)

export const unitsWithoutSquad = (
    unitSquadIndex: UnitSquadIndex,
    unitIndex: UnitIndex
) => unitIndex.filter(u => !unitSquadIndex.get(u.id))

export const createSquad = Record(
    {
        id: "",
        members: emptyMemberIndex,
        force: "",
        leader: "",
    },
    "Squad"
)

export const squadBuilder = ({
    id,
    force,
    leader,
    members,
}: {
    id: string
    force: string
    leader: string
    members: [string, number, number][]
}) =>
    createSquad({
        id,
        members: members.reduce(
            (xs, [id, x, y]) => xs.set(id, makeMember({ id, x, y })),
            Map() as MemberIndex
        ),
        force,
        leader,
    })

export const makeMember = Record(
    {
        id: "",
        x: 1,
        y: 1,
    },
    "SquadMember"
)

export const isLeader = (squad: SquadRecord, id: string) => squad.leader === id
export const changeLeader = (id: string, squad: SquadRecord) =>
    squad.set("leader", id)

export const mapSquadMembers = (fn: (s: MemberRecord) => MemberRecord) => (
    index: SquadIndex
) => index.map(squad => squad.set("members", squad.members.map(fn)))

export const filterMembersFromSquad = (fn: (s: MemberRecord) => boolean) => (
    squad: SquadRecord
) => squad.set("members", squad.members.filter(fn))

export const filterMembers = (fn: (s: MemberRecord) => boolean) => (
    index: SquadIndex
) => index.map(filterMembersFromSquad(fn))

export const mapMembers = (fn: (s: MemberRecord) => MemberRecord) => (
    squadId: string
) => (index: SquadIndex) =>
    index.map(squad =>
        squad.id === squadId
            ? squad.set("members", squad.members.map(fn))
            : squad
    )

/** Returns a List with the squad members from all indexed squads */
export const getAllUnits = (index: SquadIndex): List<MemberRecord> =>
    index.reduce(
        (xs, x) => xs.concat(x.members.toList()),
        List() as List<MemberRecord>
    )

export const getUnitsFromSquad = (id: string) => (
    index: SquadIndex
): List<MemberRecord> => getAllUnits(index.filter(s => s.id === id))

export const rejectUnitsFromSquad = (id: string) => (
    index: SquadIndex
): List<MemberRecord> => getAllUnits(index.filter(s => s.id !== id))

export const getMember = (unitId: string, squad: SquadRecord): MemberRecord => {
    const member = squad.members.get(unitId)

    if (!member) throw new Error(INVALID_STATE)

    return member
}

export const getMemberUnit = (units: UnitIndex) => (member: MemberRecord) =>
    getUnit(member.id, units)

export const getSquadUnits = (
    squadId: string,
    units: UnitIndex,
    unitSquadIndex: UnitSquadIndex
): UnitIndex =>
    unitSquadIndex
        .filter(sqd => sqd === squadId)
        .map((_v, k) => getUnit(k, units))

export const getSquadMember = (
    squadId: string,
    memberId: string,
    index: SquadIndex
) => getMember(memberId, getSquad(squadId, index))

export const getLeader = (squad: SquadRecord) => {
    const leader = squad.members.get(squad.leader)

    if (!leader)
        throw new Error(
            `Invalid State : Didn't find leader squad leader(${squad.leader}) 
            on member index (${squad.members})`
        )

    return leader
}

export const findMember = (
    fn: (m: MemberRecord) => boolean,
    squad: SquadRecord
) => squad.members.find(fn)

/**
 * Adds a new member or updates an existing one.
 */
export const updateMember = (
    squad: SquadRecord,
    member: MemberRecord
): SquadRecord =>
    squad
        .set("members", squad.members.set(member.id, member))
        .set("leader", squad.leader === "" ? member.id : squad.leader)

export const removeMember = (id: string, squad: SquadRecord): SquadRecord =>
    squad.set("members", squad.members.delete(id))

export const changeSquadMemberPosition = (
    unit: MemberRecord,
    squad: SquadRecord,
    x: number,
    y: number
) => updateMember(squad, unit.merge({ x, y }))

export const getMemberByPosition = ({ x, y }: { x: number; y: number }) => (
    sqd: SquadRecord
) => sqd.members.find(m => m.x === x && m.y === y)

export const addMember = (
    unit: Unit,
    squad: SquadRecord,
    x: number,
    y: number
) => {
    const newMember = makeMember({ id: unit.id, x, y })
    const memberToRemove = getMemberByPosition({ x, y })(squad)

    if (memberToRemove) {
        const updatedSquad = filterMembersFromSquad(
            m => m.id !== memberToRemove.id
        )(squad)

        return {
            updatedSquad,
            added: [newMember.id],
            removed: [memberToRemove.id],
        }
    } else {
        const updatedSquad = updateMember(squad, newMember)

        return { updatedSquad, added: [newMember.id], removed: [] as string[] }
    }
}
export const invertBoardPosition = (n: number) => {
    // TOOD: use a range, like this
    // const positions = [1,2,3]
    // return positions.reverse()[n+1]

    if (n === 1) return 3
    else if (n === 3) return 1
    else return n
}

/**
 * Mirrors a squad member position
 *
 * x x 1      x x 3
 * x x 2  =>  2 x x
 * 3 x x      1 x x
 *
 * Used to enable targeting when two squads are facing each other
 *
 */
export function transpose(member: MemberRecord): MemberRecord {
    const { x, y } = member
    return member.merge(
        Map({
            x: invertBoardPosition(x) + 3,
            y: invertBoardPosition(y),
        })
    )
}
