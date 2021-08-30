import * as Unit from "../../Unit/Model"
import { getUnitAttack } from "../../Unit/Skills/Skills"
import { random } from "../../utils/random"
import * as Squad from "../../Squad/Model"
import { List } from "immutable"
import { INVALID_STATE } from "../../errors"
import {
    XPInfo,
    DisplayXP,
    RemainingAttacksIndex,
    TurnState,
    TurnCommand,
    noAttacksRemaining,
    createInitiativeList,
} from "./Model"
import { slash } from "./skills/slash"
import { shoot } from "./skills/shoot"
import { fireball } from "./skills/fireball"
import { calcXp } from "./calcXp"

export const displayXPCmd = (xpInfo: List<XPInfo>): DisplayXP => ({
    type: "DISPLAY_XP",
    xpInfo,
})

export const runCombat = ({
    squadIndex,
    unitIndex,
    unitSquadIndex,
}: {
    squadIndex: Squad.SquadIndex
    unitIndex: Unit.UnitIndex
    unitSquadIndex: Squad.UnitSquadIndex
}): TurnCommand[] => {
    const remainingAttacksIndex: RemainingAttacksIndex = unitIndex
        .map((unit) => ({
            id: unit.id,
            remainingAttacks: getUnitAttack(squadIndex, unit, unitSquadIndex)
                .times,
        }))
        .reduce(
            (xs, x) => ({ ...xs, [x.id]: x.remainingAttacks }),
            {} as RemainingAttacksIndex
        )

    const initialTurnState: TurnState = {
        unitIndex: unitIndex,
        squadIndex: squadIndex,
        unitSquadIndex: Squad.createUnitSquadIndex(squadIndex),
        initiative: createInitiativeList(unitIndex),
        remainingAttacksIndex,
        turn: 0,
        squadDamage: squadIndex.map(() => 0),
    }
    return runTurn(initialTurnState, [])
}
// TODO: remove mutations from this
export const runTurn = (
    turnState: TurnState,
    commands: TurnCommand[]
): TurnCommand[] => {
    const {
        unitIndex,
        unitSquadIndex,
        squadIndex,
        initiative,
        remainingAttacksIndex,
        turn,
    } = turnState

    const currentUnitId = initiative.get(turn)
    if (!currentUnitId) throw new Error(INVALID_STATE)

    const remainingAttacks = remainingAttacksIndex[currentUnitId]
    const unit = Unit.getUnit(currentUnitId, unitIndex)
    const isLast = initiative.size - 1 === turn

    const nextTurn = isLast ? 0 : turn + 1

    let turnCommands: TurnCommand[] = []

    const hasRemainingAttacks = remainingAttacks > 0

    if (hasRemainingAttacks && Unit.isAlive(unit)) {
        let res
        // TODO, FIXME: this is bad and ugly
        switch (unit.job) {
            case "fighter":
                res = slash(turnState, commands)
                turnCommands = res.commands
                turnState.unitIndex = res.updatedUnits
                turnState.remainingAttacksIndex = res.remainingAttacks
                turnState.squadDamage = res.squadDamage
                break
            case "archer":
                res = shoot(turnState, commands)
                turnCommands = res.commands
                turnState.unitIndex = res.updatedUnits
                turnState.remainingAttacksIndex = res.remainingAttacks
                turnState.squadDamage = res.squadDamage
                break
            case "mage":
                res = fireball(turnState, commands)
                turnCommands = res.commands
                turnState.unitIndex = res.updatedUnits
                turnState.remainingAttacksIndex = res.remainingAttacks
                turnState.squadDamage = res.squadDamage
                break
        }
    } else {
        turnCommands = commands
    }

    const { unitsWithXp, cmds: xpCmds } = calcXp(
        squadIndex,
        turnState.unitIndex,
        unitSquadIndex
    )

    const endCombat: (cmds: TurnCommand[]) => TurnCommand[] = (
        commands: TurnCommand[]
    ) => {
        return commands.concat(xpCmds).concat([
            {
                type: "END_COMBAT",
                units: unitsWithXp.map((u) => u.unit),
                squadDamage: turnState.squadDamage,
            },
        ])
    }

    if (noAttacksRemaining(turnState.unitIndex, remainingAttacksIndex)) {
        return endCombat(turnCommands)
    } else {
        return runTurn({ ...turnState, turn: nextTurn }, turnCommands)
    }
}
