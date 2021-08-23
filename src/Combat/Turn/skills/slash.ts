import * as Unit from "../../../Unit/Model"
import { getUnitDamage } from "../../../Unit/Skills/Skills"
import { getMeleeTarget } from "../../getMeleeTarget"
import * as Squad from "../../../Squad/Model"
import { INVALID_STATE } from "../../../errors"
import { TurnCommand, TurnState } from "../Model"

export function slash(state: TurnState, commands: TurnCommand[]) {
    const {
        unitIndex,
        squadIndex,
        unitSquadIndex,
        initiative,
        remainingAttacksIndex,
        turn,
        squadDamage,
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

    const move: TurnCommand = {
        type: "MOVE",
        source: current.id,
        target: target.id,
    }
    const slash: TurnCommand = {
        type: "SLASH",
        source: current.id,
        target: target.id,
        damage,
        updatedTarget: updatedTarget,
        updatedSource: updatedSource,
    }

    const returnCmd: TurnCommand = { type: "RETURN", target: current.id }

    const currentSquad = Squad.getUnitSquad(
        current.id,
        squadIndex,
        unitSquadIndex
    )

    const currentSquadDamage = squadDamage.get(currentSquad.id) || 0

    return {
        commands: commands.concat([move, slash, returnCmd]),
        updatedUnits,
        remainingAttacks: updatedRemainingAttacksIndex,
        squadDamage: squadDamage.set(
            currentSquad.id,
            currentSquadDamage + damage
        ),
    }
}
