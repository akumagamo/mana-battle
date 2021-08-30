import * as Unit from "../../Unit/Model"
import * as Squad from "../../Squad/Model"
import { List, Map } from "immutable"
import { random } from "../../utils/random"

export type TurnCommand =
    | Move
    | Shoot
    | Fireball
    | Slash
    | EndTurn
    | DisplayXP
    | RestartTurns
    | Return
    | EndCombat

export type Move = { type: "MOVE"; source: string; target: string }
export type Return = { type: "RETURN"; target: string }
export type Slash = {
    type: "SLASH"
    source: string
    target: string
    damage: number
    updatedTarget: Unit.Unit
    updatedSource: Unit.Unit
}
export type Shoot = {
    type: "SHOOT"
    source: string
    target: string
    damage: number
    updatedTarget: Unit.Unit
    updatedSource: Unit.Unit
}
export type Fireball = {
    type: "FIREBALL"
    source: string
    target: string
    damage: number
    updatedTarget: Unit.Unit
    updatedSource: Unit.Unit
}

export type EndCombat = {
    type: "END_COMBAT"
    units: Unit.UnitIndex
    squadDamage: Map<string, number>
}
export type EndTurn = { type: "END_TURN" }
export type RestartTurns = { type: "RESTART_TURNS" }
export type DisplayXP = {
    type: "DISPLAY_XP"
    xpInfo: List<XPInfo>
}

export type XPInfo = {
    xp: number
    lvls: number
    id: string
}

export type TurnState = {
    unitIndex: Unit.UnitIndex
    unitSquadIndex: Squad.UnitSquadIndex
    squadIndex: Squad.SquadIndex
    initiative: List<string>
    remainingAttacksIndex: RemainingAttacksIndex
    turn: number
    squadDamage: Map<string, number>
}

export type RemainingAttacksIndex = { [id: string]: number }

export function noAttacksRemaining(
    units: Unit.UnitIndex,
    remainingAttacks: RemainingAttacksIndex
) {
    return Unit.getAliveUnits(units).every((u) => remainingAttacks[u.id] < 1)
}

const sortInitiative = (unit: Unit.Unit) => {
    return random(1, 6) + unit.dex
}

export const createInitiativeList = (units: Unit.UnitIndex): List<string> =>
    units
        .toList()
        .sortBy(sortInitiative)
        .reverse()
        .map((u) => u.id)
