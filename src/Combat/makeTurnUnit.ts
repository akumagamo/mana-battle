import * as Squad from "../Squad/Model"
import { Unit } from "../Unit/Model"
import { getUnitAttack } from "../Unit/Skills/Skills"

export function makeTurnUnit(
    squadIndex: Squad.SquadIndex,
    unit: Unit,
    unitSquadIndex: Squad.UnitSquadIndex
) {
    return {
        remainingAttacks: getUnitAttack(squadIndex, unit, unitSquadIndex).times,
        unit,
    }
}
