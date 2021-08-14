import { CombatBoardState } from "./Model";

export default function (state: CombatBoardState) {
  state.charaIndex.map((c) => c.destroy());
}
