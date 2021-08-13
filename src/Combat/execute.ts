import fireball from "./animations/fireball";
import moveUnit from "./animations/moveUnit";
import returnToPosition from "./animations/returnToPosition";
import shoot from "./animations/shoot";
import slash from "./animations/slash";
import { CombatBoardState } from "./Model";
import { Command } from "./turns";

export default async function execute(
  commands: Command[],
  state: CombatBoardState
) {
  const cmd = commands[0];

  const step = () => {
    const [, ...next_] = commands;

    if (next_.length === 0) console.log(`finish!`);
    else execute(next_, state);
  };

  console.log(cmd);

  if (cmd.type === "MOVE") {
    await moveUnit(cmd.source, cmd.target, state);
  } else if (cmd.type === "SLASH") {
    state.unitIndex = state.unitIndex.set(cmd.target, cmd.updatedTarget);
    await slash(cmd.source, cmd.target, cmd.damage, state);
  } else if (cmd.type === "SHOOT") {
    state.unitIndex = state.unitIndex.set(cmd.target, cmd.updatedTarget);
    await shoot(cmd.source, cmd.target, cmd.damage, state);
  } else if (cmd.type === "FIREBALL") {
    state.unitIndex = state.unitIndex.set(cmd.target, cmd.updatedTarget);
    await fireball(cmd.source, cmd.target, cmd.damage, state);
  } else if (cmd.type === "RETURN") {
    await returnToPosition(cmd.target, state);
  } else if (cmd.type === "END_TURN") {
    // this.currentTurn = this.currentTurn + 1;
    // this.turn();
  } else if (cmd.type === "RESTART_TURNS") {
    // this.currentTurn = 0;
    // this.turn();
  } else if (cmd.type === "DISPLAY_XP") {
    // await this.displayExperienceGain(cmd.xpInfo);
    // step();
  } else if (cmd.type === "END_COMBAT") {
    // await this.combatEnd(cmd.units, cmd.squadDamage);
    // this.turnOff();
  } else if (cmd.type === "VICTORY") {
    // await this.combatEnd(cmd.units, Map() as Map<string, number>);
    // this.turnOff();
  } else console.error(`Unknown command:`, cmd);

  step();
}
