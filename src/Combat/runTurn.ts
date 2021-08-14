import execute from "./execute";
import {CombatBoardState} from "./Model";
import {runCombat} from "./turns";

export function runTurn(state: CombatBoardState) {
  const commands = runCombat(state);
  execute(commands, state);
}

