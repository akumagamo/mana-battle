import { INVALID_STATE } from "../errors"
import * as Squad from "../Squad/Model"
import * as Unit from "../Unit/Model"

// TODO: this should receive alive members
export function getMeleeTarget(
    current: Unit.Unit,
    unitIndex: Unit.UnitIndex,
    squadIndex: Squad.SquadIndex,
    unitSquadIndex: Squad.UnitSquadIndex
): Squad.MemberRecord {
    const aliveIndex = Squad.filterMembers(m => {
        const unit = unitIndex.get(m.id)
        if (unit) return Unit.isAlive(unit)
        else return false
    })(squadIndex)

    const squad = unitSquadIndex.get(current.id)

    if (!squad) throw new Error(INVALID_STATE)

    const transposedIndex = Squad.mapMembers(Squad.transpose)(squad)(aliveIndex)

    const units = Squad.rejectUnitsFromSquad(squad)(transposedIndex)

    const get = (unitId: string) => {
        const squadId = unitSquadIndex.get(unitId)

        if (!squadId) throw new Error(INVALID_STATE)

        return transposedIndex.get(squadId)?.members.get(unitId)
    }

    const sorted = units
        .map(unit => ({
            distance:
                Math.abs(unit.x - (get(current.id)?.x || 0)) +
                Math.abs(unit.y - (get(current.id)?.y || 0)),
            unit,
        }))
        .sort((a, b) => a.distance - b.distance)

    return sorted.map(u => u.unit).first<Squad.MemberRecord>()
}
