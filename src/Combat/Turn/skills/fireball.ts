import * as Unit from "../../../Unit/Model"
import { getUnitDamage } from "../../../Unit/Skills/Skills"
import { getMeleeTarget } from "../../getMeleeTarget"
import * as Squad from "../../../Squad/Model"
import { INVALID_STATE } from "../../../errors"
import { TurnCommand, TurnState } from "../Model"

export function fireball(state: TurnState, commands: TurnCommand[]) {
    const {
        unitIndex,
        squadIndex,
        initiative,
        remainingAttacksIndex,
        turn,
        squadDamage,
        unitSquadIndex,
    } = state

    const id = initiative.get(turn)
    if (!id) throw new Error(INVALID_STATE)
    const current = Unit.getUnit(id, unitIndex)
    const target = getMeleeTarget(
        current,
        unitIndex,
        squadIndex,
        unitSquadIndex
    )

    const damage = getUnitDamage(squadIndex, current, unitSquadIndex)

    const targetUnit = Unit.getUnit(target.id, unitIndex)
    const newHp = targetUnit.currentHp - damage
    const currentHp = newHp < 1 ? 0 : newHp

    const updatedUnits = Unit.update({ ...targetUnit, currentHp })(unitIndex)

    const updatedRemainingAttacksIndex = {
        ...remainingAttacksIndex,
        [current.id]: remainingAttacksIndex[current.id] - 1,
    }

    const updatedTarget = Unit.getUnit(target.id, updatedUnits)

    const updatedSource = Unit.getUnit(current.id, updatedUnits)

    const shoot: TurnCommand = {
        type: "FIREBALL",
        source: current.id,
        target: target.id,
        damage,
        updatedTarget: updatedTarget,
        updatedSource: updatedSource,
    }

    const currentSquad = Squad.getUnitSquad(
        current.id,
        squadIndex,
        unitSquadIndex
    )

    const currentSquadDamage = squadDamage.get(currentSquad.id) || 0

    return {
        commands: commands.concat([shoot]),
        updatedUnits,
        remainingAttacks: updatedRemainingAttacksIndex,
        squadDamage: squadDamage.set(
            currentSquad.id,
            currentSquadDamage + damage
        ),
    }
}
