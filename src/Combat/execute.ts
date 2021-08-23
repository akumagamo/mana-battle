import CombatEnded from "../Battlefield/events/CombatEnded"
import fireball from "./animations/fireball"
import moveUnit from "./animations/moveUnit"
import returnToPosition from "./animations/returnToPosition"
import shoot from "./animations/shoot"
import slash from "./animations/slash"
import { CombatBoardState } from "./Model"
import { TurnCommand } from "./Turn/Model"
import { runTurn } from "./Turn/runTurn"
import turnOff from "./Turn/turnOff"

export default async function execute(
    commands: TurnCommand[],
    state: CombatBoardState
) {
    const [cmd] = commands

    const step = () => {
        const [, ...next_] = commands

        if (next_.length !== 0) execute(next_, state)
    }

    if (cmd.type === "MOVE") {
        await moveUnit(cmd.source, cmd.target, state)
    } else if (cmd.type === "SLASH") {
        state.unitIndex = state.unitIndex.set(cmd.target, cmd.updatedTarget)
        await slash(
            cmd.source,
            cmd.target,
            cmd.updatedTarget.currentHp,
            cmd.damage,
            state
        )
    } else if (cmd.type === "SHOOT") {
        state.unitIndex = state.unitIndex.set(cmd.target, cmd.updatedTarget)
        await shoot(
            cmd.source,
            cmd.target,
            cmd.updatedTarget.currentHp,
            cmd.damage,
            state
        )
    } else if (cmd.type === "FIREBALL") {
        state.unitIndex = state.unitIndex.set(cmd.target, cmd.updatedTarget)
        await fireball(
            cmd.source,
            cmd.target,
            cmd.updatedTarget.currentHp,
            cmd.damage,
            state
        )
    } else if (cmd.type === "RETURN") {
        await returnToPosition(cmd.target, state)
    } else if (cmd.type === "END_TURN") {
        state.currentTurn = state.currentTurn + 1
        runTurn(state)
    } else if (cmd.type === "RESTART_TURNS") {
        state.currentTurn = 0
        runTurn(state)
    } else if (cmd.type === "DISPLAY_XP") {
        // await this.displayExperienceGain(cmd.xpInfo);
        step()
    } else if (cmd.type === "END_COMBAT") {
        CombatEnded(state.scene).emit({
            units: cmd.units,
            squadDamage: cmd.squadDamage,
        })
        turnOff(state)
    } else console.error(`Unknown command:`, cmd)

    step()
}
