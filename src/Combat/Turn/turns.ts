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
} from "./Model"
import { slash } from "./skills/slash"
import { shoot } from "./skills/shoot"
import { fireball } from "./skills/fireball"

const sortInitiative = (unit: Unit.Unit) => {
    return random(1, 6) + unit.dex
}

export const initiativeList = (units: Unit.UnitIndex): List<string> =>
    units
        .toList()
        .sort((a, b) => sortInitiative(b) - sortInitiative(a))
        .map((u) => u.id)

const displayXPCmd = (xpInfo: List<XPInfo>): DisplayXP => ({
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

    const initiative = initiativeList(unitIndex)

    const initialTurnState: TurnState = {
        unitIndex: unitIndex,
        squadIndex: squadIndex,
        unitSquadIndex: Squad.createUnitSquadIndex(squadIndex),
        initiative,
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

function calcXp(
    squadIndex: Squad.SquadIndex,
    units: Unit.UnitIndex,
    unitSquadIndex: Squad.UnitSquadIndex
) {
    const squadXp = squadIndex.map((squad) => {
        const enemyUnits = Squad.getSquadUnits(squad.id, units, unitSquadIndex)

        const deadEnemies = enemyUnits
            .map((u) => (u.currentHp < 1 ? 1 : 0))
            .reduce((xs, x) => xs + x, 0)

        const xpAmount = deadEnemies * 40

        return { squadId: squad.id, xpAmount }
    })

    const MAX_XP = 100

    const unitsWithXp = units.map((unit) => {
        const unitSquad = Squad.getUnitSquad(
            unit.id,
            squadIndex,
            unitSquadIndex
        )

        const xp = squadXp.get(unitSquad.id)
        if (!xp) throw new Error(INVALID_STATE)

        const { xpAmount } = xp

        if (xpAmount < 1) return { xp: 0, lvls: 0, unit }

        const newXp = unit.exp + xpAmount

        const lvls = Math.floor(newXp / MAX_XP)

        return {
            unit: {
                ...unit,
                lvl: unit.lvl + lvls,
                xp: newXp,
            },

            xp: xpAmount,
            lvls,
        }
    })

    const xps = unitsWithXp
        .filter(({ xp, lvls }) => xp > 0 || lvls > 0)
        .map(({ unit, xp, lvls }) => ({ id: unit.id, xp, lvls }))
        .toList()

    return {
        unitsWithXp,
        cmds: xps.size > 0 ? [displayXPCmd(xps)] : [],
    }
}

function noAttacksRemaining(
    units: Unit.UnitIndex,
    remainingAttacks: RemainingAttacksIndex
) {
    return Unit.getAliveUnits(units).every((u) => remainingAttacks[u.id] < 1)
}
